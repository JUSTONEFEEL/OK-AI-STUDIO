import { GoogleGenAI } from "@google/genai";

// We create a fresh instance on every call to ensure we capture the latest key if updated via window.aistudio
const getAI = () => {
  const customKey = localStorage.getItem('gemini_api_key');
  return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY });
};

/**
 * Helper to convert Blob to Base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Generate Text (Script, Prompt refinement)
 */
export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are a creative director assistant.",
      }
    });
    return response.text || "No text generated.";
  } catch (error) {
    console.error("Text generation error:", error);
    throw error;
  }
};

interface ImageGenOptions {
    aspectRatio?: string;
    model?: string;
}

/**
 * Generate Image
 * Defaults to 'gemini-2.5-flash-image' (Nano Banana) for fast generation.
 */
export const generateImage = async (prompt: string, options: ImageGenOptions = {}): Promise<string> => {
  try {
    const ai = getAI();
    const model = options.model || 'gemini-2.5-flash-image';
    const aspectRatio = options.aspectRatio || "16:9"; 

    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio,
      }
    };

    if (model.includes('pro')) {
       config.imageConfig.imageSize = "1K";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: config
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};

/**
 * Remove Background (using Gemini 2.5 Flash Image)
 */
export const removeImageBackground = async (imageSrc: string): Promise<string> => {
  try {
    const ai = getAI();
    const base64Data = imageSrc.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: 'Remove the background from this image. Return ONLY the image with transparent background.' }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No processed image returned.");
  } catch (error) {
    console.error("Background removal error:", error);
    throw error;
  }
};

/**
 * Edit Image (Enhance, Upscale, etc. using Gemini)
 */
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const ai = getAI();
    const base64Data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No processed image returned.");
  } catch (error) {
    console.error("Image edit error:", error);
    throw error;
  }
};

/**
 * Generate Video (Veo)
 */
export const generateVideo = async (prompt: string, imageContext?: string): Promise<string> => {
  try {
    if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }
    }

    const ai = getAI();
    let operation;
    
    if (imageContext) {
        const base64Data = imageContext.split(',')[1];
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            image: {
                imageBytes: base64Data,
                mimeType: 'image/png'
            },
            prompt: prompt || "Animate this scene naturally.",
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
    } else {
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
    }

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); 
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed to return a URI.");

    const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
    const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
};

/**
 * Generate Audio (TTS)
 */
export const generateAudio = async (prompt: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data generated");
    
    return `data:audio/mp3;base64,${base64Audio}`; 
  } catch (error) {
    console.error("Audio generation error:", error);
    throw error;
  }
}

/**
 * Analyze Image to get structured prompt (EN/ZH) - Using Gemini 2.5 Flash
 */
export const analyzeImage = async (base64Image: string): Promise<{ en: string, zh: string }> => {
  try {
    const ai = getAI();
    const base64Data = base64Image.split(',')[1];
    
    const prompt = `
      Analyze this image and generate a structured AI image generation prompt.
      
      Structure requirements:
      1. Camera (Shot type, lens, angle)
      2. Subject (Main character/object description)
      3. Environment (Background, lighting, time)
      4. Atmosphere (Mood, feeling)
      5. Style (Art style, medium, reference)

      Return a JSON object with exactly two keys:
      - "en": The structured prompt in English.
      - "zh": The structured prompt in Chinese.
      
      Return ONLY the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: prompt }
        ]
      },
      config: {
          responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "{}";
    const jsonStr = text.replace(/```json|```/g, '').trim();
    let result = JSON.parse(jsonStr);
    
    const flatten = (val: any) => {
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val !== null) {
            return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join('\n');
        }
        return String(val);
    }
    
    return {
        en: flatten(result.en) || "Analysis failed.",
        zh: flatten(result.zh) || "分析失败。"
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    return { en: "Analysis failed.", zh: "分析失败。" };
  }
}

/**
 * Analyze Image Structure (Color, Composition, Style) - Using Gemini 2.5 Flash
 */
export const analyzeImageStructure = async (base64Image: string): Promise<string> => {
  try {
    const ai = getAI();
    const base64Data = base64Image.split(',')[1];
    
    const prompt = `
      Analyze this image and extract its visual attributes into a strictly structured JSON object.
      Return a JSON object with exactly two keys: "en" and "zh".
      Each contains: "visual_style", "color_palette", "composition", "layout", "special_effects".
      Return ONLY the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: prompt }
        ]
      },
      config: {
          responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "{}";
    return text.replace(/```json|```/g, '').trim();

  } catch (error) {
    console.error("Structure analysis error:", error);
    return JSON.stringify({ error: "Analysis failed" }, null, 2);
  }
}

/**
 * Analyze Image DNA (Comprehensive Visual Character) - Using Gemini 2.5 Flash
 */
export const analyzeImageDna = async (base64Image: string): Promise<string> => {
  try {
    const ai = getAI();
    const base64Data = base64Image.split(',')[1];
    
    const prompt = `
      You are an expert visual forensic analyst. Extract the "VISUAL DNA" of this image.
      Return a JSON object with exactly two keys: "en" and "zh".
      Each key must contain: "narrative_essence", "stylistic_fingerprint", "chromatic_base", "compositional_logic", "lighting_physics", "texture_profile", "emotional_wavelength".
      Return ONLY the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: prompt }
        ]
      },
      config: {
          responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "{}";
    return text.replace(/```json|```/g, '').trim();

  } catch (error) {
    console.error("DNA analysis error:", error);
    return JSON.stringify({ error: "DNA extraction failed" }, null, 2);
  }
}