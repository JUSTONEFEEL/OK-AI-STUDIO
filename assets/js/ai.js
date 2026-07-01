// AI 服务层 - 接入 zhy.lk666.ai API
// 用户需要在设置页面配置 API Key

const AI_CONFIG_KEY = 'api_config';

// 从 Supabase settings 表获取 API 配置
async function getAIConfig() {
  if (typeof db === 'undefined') return null;
  try {
    const settings = await db.getSetting(AI_CONFIG_KEY);
    return settings?.value || null;
  } catch (e) {
    console.warn('Failed to get AI config:', e);
    return null;
  }
}

// 保存 API 配置到 Supabase
async function saveAIConfig(config) {
  if (typeof db === 'undefined') return false;
  try {
    await db.upsertSetting(AI_CONFIG_KEY, config);
    return true;
  } catch (e) {
    console.error('Failed to save AI config:', e);
    return false;
  }
}

// AI 服务
const ai = {
  config: null,

  // 初始化配置
  async init() {
    this.config = await getAIConfig();
    return this.config;
  },

  // 检查是否已配置 API Key
  isConfigured() {
    return this.config?.api_key && this.config?.api_key.length > 0;
  },

  // 获取可用模型列表
  getModels(type) {
    if (!this.config?.models) return [];
    return this.config.models[type] || [];
  },

  // ===== 智能对话 =====
  async chat(model, messages, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('请先在设置页面配置 API Key');
    }

    const response = await fetch(`${this.config.base_url}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.api_key}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: options.stream || false,
        max_tokens: options.max_tokens || 4096,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Chat API error: ${response.status} ${err}`);
    }

    if (options.stream) {
      return response; // 返回 stream response，由调用方处理
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  },

  // ===== 图像生成 =====
  async generateImage(prompt, model = 'flux', options = {}) {
    if (!this.isConfigured()) {
      throw new Error('请先在设置页面配置 API Key');
    }

    const response = await fetch(`${this.config.base_url}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.api_key}`
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        n: options.n || 1,
        size: options.size || '1024x1024',
        response_format: 'url'
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Image API error: ${response.status} ${err}`);
    }

    const data = await response.json();
    return data.data?.[0]?.url || data.url || data;
  },

  // ===== 视频生成 =====
  async generateVideo(prompt, model = 'vidu', options = {}) {
    if (!this.isConfigured()) {
      throw new Error('请先在设置页面配置 API Key');
    }

    // 视频生成通常需要更长时间，可能需要轮询状态
    const response = await fetch(`${this.config.base_url}/v1/videos/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.api_key}`
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        duration: options.duration || 5,
        aspect_ratio: options.aspect_ratio || '16:9'
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Video API error: ${response.status} ${err}`);
    }

    const data = await response.json();
    // 返回任务ID或直接结果
    return data;
  },

  // ===== 语音合成 =====
  async generateAudio(text, model = 'gemini-tts', options = {}) {
    if (!this.isConfigured()) {
      throw new Error('请先在设置页面配置 API Key');
    }

    const response = await fetch(`${this.config.base_url}/v1/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.api_key}`
      },
      body: JSON.stringify({
        model: model,
        input: text,
        voice: options.voice || 'default',
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Audio API error: ${response.status} ${err}`);
    }

    // 返回音频 URL 或 blob
    if (response.headers.get('content-type')?.includes('audio')) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }

    const data = await response.json();
    return data.url || data;
  },

  // 保存生成的资源到数据库
  async saveAsset(type, prompt, resultUrl, model, employeeId = null, projectId = null) {
    if (typeof db === 'undefined') return null;
    try {
      const asset = await db.createAsset({
        type,
        prompt,
        result_url: resultUrl,
        model,
        status: 'completed',
        employee_id: employeeId,
        project_id: projectId
      });
      return asset;
    } catch (e) {
      console.error('Failed to save asset:', e);
      return null;
    }
  }
};

// 初始化 AI 服务
ai.init().catch(e => console.warn('AI init failed:', e));