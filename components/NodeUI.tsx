import React, { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NodeData, NodeType, Lang } from '../types';
import { 
  Type, Image as ImageIcon, Video, FileText, Loader2, X, Music, 
  Play, RefreshCw, Wand2, Maximize2, Upload, Plus, Copy, Check, ScanEye, Languages, Sparkles,
  Eraser, Scaling, Download, Crop, Zap, Monitor, Minimize2, FileJson, Code, Info, RectangleHorizontal, Square, RectangleVertical,
  ChevronDown, ChevronUp, ArrowUp, Settings2, Ratio, CheckSquare, Dna
} from 'lucide-react';
import CropEditor from './CropEditor';

export type ProcessType = 'removeBg' | 'enhance' | 'upscale' | 'crop';

interface NodeUIProps {
  node: NodeData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<NodeData>) => void;
  onGenerate: (id: string) => void;
  language: Lang;
  onUploadTrigger: (nodeId: string) => void;
  onProcess?: (nodeId: string, type: ProcessType, payload?: any) => void;
  onAnalyze?: (nodeId: string) => void;
  onAnalyzePrompt?: (nodeId: string) => void;
  onDnaAnalyze?: (nodeId: string) => void;
  onTextToImage?: (nodeId: string) => void;
  onJsonToImage?: (nodeId: string) => void;
  onConnectStart?: (nodeId: string) => void;
  onConnectEnd?: (nodeId: string) => void;
  scale?: number;
}

const NodeUIComponent: React.FC<NodeUIProps> = ({ 
  node, 
  isSelected, 
  onSelect, 
  onDelete, 
  onUpdate, 
  onGenerate,
  language,
  onUploadTrigger,
  onProcess,
  onAnalyze,
  onAnalyzePrompt,
  onDnaAnalyze,
  onTextToImage,
  onJsonToImage,
  onConnectStart,
  onConnectEnd,
  scale = 1
}) => {
  const [localPrompt, setLocalPrompt] = useState(node.prompt || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // State for Image Details Popup
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false); // false = EN, true = ZH
  
  // State for Fullscreen View
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  // State for Crop Editor
  const [showCropEditor, setShowCropEditor] = useState(false);

  // State for Resizing
  const [isResizing, setIsResizing] = useState(false);

  // State for Advanced Settings in Image Panel
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Identify Node Subtypes
  const isPromptAnalysis = node.meta?.subtype === 'promptAnalysis';
  const isDnaAnalysis = node.meta?.subtype === 'dnaAnalysis';
  
  // Determine if this is a Generator (Editable) or Preview (Static/Result)
  const isImageNode = node.type === NodeType.IMAGE;
  const isPreview = isImageNode && (node.prompt === 'Uploaded source file' || node.meta?.isResultCard === true);
  const isGenerator = isImageNode && !isPreview;

  // Sync local prompt
  useEffect(() => {
    setLocalPrompt(node.prompt || '');
  }, [node.prompt]);

  // Close popups on deselect
  useEffect(() => {
    if (!isSelected) setIsDetailsOpen(false);
  }, [isSelected]);

  // Track Node Height
  useEffect(() => {
    if (!nodeRef.current) return;
    if (node.height || isResizing) return; 
    
    const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
            if (Math.abs(height - (node.height || 0)) > 1) {
                // Only auto-update height for standard nodes, not Card nodes which have explicit height
                if (node.type !== NodeType.IMAGE && node.type !== NodeType.JSON && !isPromptAnalysis) {
                   onUpdate(node.id, { height });
                }
            }
        }
    });

    observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [node.id, node.height, onUpdate, isResizing, node.type, isPromptAnalysis]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrompt(e.target.value);
    onUpdate(node.id, { prompt: e.target.value });
  };

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localPrompt.trim()) {
      onGenerate(node.id);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const resolution = `${width} x ${height}`;
    const aspectRatio = width / height;

    if (node.meta?.resolution !== resolution || node.meta?.aspectRatio !== aspectRatio) {
        onUpdate(node.id, { 
            meta: { ...node.meta, resolution, aspectRatio } 
        });
    }
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    const width = vid.videoWidth;
    const height = vid.videoHeight;
    const resolution = `${width} x ${height}`;
    const aspectRatio = width / height;

    if (node.meta?.resolution !== resolution || node.meta?.aspectRatio !== aspectRatio) {
        onUpdate(node.id, { 
            meta: { ...node.meta, resolution, aspectRatio } 
        });
    }
  };

  const handleImageClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.content) {
        const link = document.createElement('a');
        link.href = node.content;
        link.download = node.meta?.fileName || `image-${node.id.slice(0, 4)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleAnalyzeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onAnalyze) onAnalyze(node.id);
  };

  const handlePromptButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onAnalyzePrompt) onAnalyzePrompt(node.id);
  };

  const handleDnaClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDnaAnalyze) onDnaAnalyze(node.id);
  };

  const handleProcessClick = (e: React.MouseEvent, type: ProcessType) => {
      e.stopPropagation();
      if (type === 'crop') {
          setShowCropEditor(true);
      } else {
          if (onProcess) onProcess(node.id, type);
      }
  };

  const handleCropConfirm = (croppedImage: string) => {
      setShowCropEditor(false);
      if (onProcess) onProcess(node.id, 'crop', croppedImage);
  };

  const getMockPath = () => {
      const fileName = node.meta?.fileName || 'untitled';
      return `/User/Projects/Assets/Source/${fileName}`;
  };

  const copyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    const path = getMockPath();
    navigator.clipboard.writeText(path);
    setPathCopied(true);
    setTimeout(() => setPathCopied(false), 2000);
  };

  // --- Resize Handler ---
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true); 
    const startX = e.clientX;
    const startY = e.clientY;
    const defaultW = (node.type === NodeType.JSON || isPromptAnalysis) ? 450 : 320;
    const initialWidth = node.width || defaultW;
    const initialHeight = node.height || 400;

    const onMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
        const deltaX = (moveEvent.clientX - startX) / scale;
        const deltaY = (moveEvent.clientY - startY) / scale;
        const newWidth = Math.round(Math.max(300, initialWidth + deltaX));
        const newHeight = Math.round(Math.max(150, initialHeight + deltaY));
        onUpdate(node.id, { width: newWidth, height: newHeight });
    };

    const onUp = () => {
        setIsResizing(false); 
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const getText = (key: string) => {
    const texts: Record<Lang, Record<string, string>> = {
      en: {
        text: "TEXT",
        image: "IMAGE",
        video: "VIDEO",
        audio: "AUDIO",
        json: "JSON DATA",
        creating: "Creating",
        processing: "Processing",
        generate: "Generate",
        regenerate: "Regenerate",
        describePrefix: "Describe the",
        describeSuffix: "you want to create...",
        upload: "Replace",
        details: "Details",
        resolution: "Resolution",
        aiPrompt: "AI Prompt",
        analyzing: "Analyzing...",
        analyze: "JSON",
        analyzePrompt: "Generate Prompt",
        dna: "DNA",
        copy: "Copy",
        filename: "Filename",
        filePath: "File Path",
        removeBg: "Remove BG",
        enhance: "Enhance",
        upscale: "Upscale",
        info: "Info",
        textToImage: "Text to Image",
        jsonToImage: "Params to Image",
        uploadRef: "Upload Reference",
        advSettings: "Advanced Settings"
      },
      zh: {
        text: "文本",
        image: "图像",
        video: "视频",
        audio: "音频",
        json: "结构数据",
        creating: "正在生成",
        processing: "正在处理中",
        generate: "生成",
        regenerate: "重新生成",
        describePrefix: "描述你想要生成的",
        describeSuffix: "...",
        upload: "上传替换",
        details: "详情信息",
        resolution: "分辨率",
        aiPrompt: "AI 提示词",
        analyzing: "智能分析中...",
        analyze: "JSON",
        analyzePrompt: "生成提示词",
        dna: "DNA",
        copy: "复制",
        filename: "文件名",
        filePath: "文件路径",
        removeBg: "去背景",
        enhance: "高清",
        upscale: "放大",
        info: "详情",
        textToImage: "文生图",
        jsonToImage: "参数生图",
        uploadRef: "上传参考图",
        advSettings: "高级设置"
      }
    };
    return texts[language][key] || key;
  };

  const getTypeLabel = () => {
      switch(node.type) {
          case NodeType.TEXT: return getText('text');
          case NodeType.IMAGE: return getText('image');
          case NodeType.VIDEO: return getText('video');
          case NodeType.AUDIO: return getText('audio');
          case NodeType.JSON: return getText('json');
          default: return node.type;
      }
  }

  // --- TOOLBAR COMPONENTS ---

  const ImageGeneratorPanel = () => {
      const currentModel = node.meta?.model || 'gemini-2.5-flash-image';
      const currentRatio = node.meta?.aspectRatio || '16:9'; // Default 16:9 for generator

      const updateModel = (model: string) => {
          onUpdate(node.id, { meta: { ...node.meta, model } });
      };

      const updateRatio = (ratio: string) => {
          onUpdate(node.id, { meta: { ...node.meta, aspectRatio: ratio } });
      };

      return (
          <div 
            className="absolute top-[calc(100%+12px)] left-0 w-full bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()} 
          >
              {/* Prompt Area */}
              <div className="p-3">
                  <div className="relative">
                      <div className="absolute top-0 left-0">
                         {node.content ? (
                             <div className="w-8 h-8 rounded-md overflow-hidden border border-white/10">
                                 <img src={node.content} className="w-full h-full object-cover" />
                             </div>
                         ) : (
                             <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center border border-white/10 text-gray-500">
                                 <ImageIcon size={16} />
                             </div>
                         )}
                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-[#1e1e1e]">1</div>
                      </div>

                      <textarea
                          value={localPrompt}
                          onChange={handlePromptChange}
                          placeholder="Describe your image..."
                          className="w-full bg-transparent text-xs text-gray-200 placeholder-gray-600 pl-10 pr-2 min-h-[48px] resize-none outline-none border-none leading-relaxed"
                      />
                  </div>
              </div>

              {/* Action Buttons (Analysis/Processing) - Only show if content exists */}
              {node.content && (
                  <div className="flex items-center gap-2 px-3 pb-3 overflow-x-auto no-scrollbar">
                      <button onClick={handlePromptButtonClick} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 hover:text-white transition-colors border border-white/5">
                          <Sparkles size={10} /><span>{getText('aiPrompt')}</span>
                      </button>
                      <button onClick={handleAnalyzeClick} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 hover:text-white transition-colors border border-white/5">
                          <FileJson size={10} /><span>{getText('analyze')}</span>
                      </button>
                      <div className="w-px h-3 bg-white/10 mx-1 shrink-0" />
                      <button onClick={(e) => handleProcessClick(e, 'removeBg')} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 hover:text-white transition-colors border border-white/5">
                          <Eraser size={10} /><span>{getText('removeBg')}</span>
                      </button>
                      <button onClick={(e) => handleProcessClick(e, 'enhance')} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 hover:text-white transition-colors border border-white/5">
                          <Zap size={10} /><span>{getText('enhance')}</span>
                      </button>
                  </div>
              )}

              {/* Controls Row */}
              <div className="flex items-center gap-2 px-3 pb-3">
                  {/* Model Selector */}
                  <div className="relative group/model">
                      <button className="flex items-center gap-1.5 px-2 py-1.5 bg-black/30 hover:bg-black/50 rounded-lg text-[10px] font-medium text-gray-300 border border-white/5 hover:border-white/10 transition-all">
                          {currentModel.includes('flash') ? <Zap size={10} className="text-yellow-400 fill-yellow-400" /> : <Sparkles size={10} className="text-purple-400" />}
                          <span>{currentModel.includes('flash') ? 'Banana Flash' : 'Banana Pro'}</span>
                          <ChevronDown size={10} className="text-gray-500" />
                      </button>
                      <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#252525] border border-white/10 rounded-lg shadow-xl overflow-hidden hidden group-hover/model:block z-50">
                          <button onClick={() => updateModel('gemini-2.5-flash-image')} className="w-full text-left px-3 py-2 text-[10px] text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                              <Zap size={10} className="text-yellow-400" /> Banana Flash
                          </button>
                          <button onClick={() => updateModel('gemini-3-pro-image-preview')} className="w-full text-left px-3 py-2 text-[10px] text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                              <Sparkles size={10} className="text-purple-400" /> Banana Pro
                          </button>
                      </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="relative group/ratio">
                       <button className="flex items-center gap-1.5 px-2 py-1.5 bg-black/30 hover:bg-black/50 rounded-lg text-[10px] font-medium text-gray-300 border border-white/5 hover:border-white/10 transition-all">
                          <ImageIcon size={10} />
                          <span>{currentRatio}</span>
                          <ChevronDown size={10} className="text-gray-500" />
                      </button>
                      <div className="absolute bottom-full left-0 mb-2 w-24 bg-[#252525] border border-white/10 rounded-lg shadow-xl overflow-hidden hidden group-hover/ratio:block z-50">
                          {['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => (
                              <button key={r} onClick={() => updateRatio(r)} className="w-full text-left px-3 py-2 text-[10px] text-gray-300 hover:bg-white/5 hover:text-white">
                                  {r}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2">
                      <div className="w-3 h-3 border border-gray-600 rounded flex items-center justify-center"></div>
                      <span className="text-[10px] text-gray-400">Auto</span>
                  </div>

                  <div className="flex-1" />
                  <span className="text-[10px] text-gray-500 font-mono">1x</span>

                  <button 
                    onClick={handleGenerateClick}
                    disabled={node.isGenerating}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        node.isGenerating ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-400 hover:scale-105 active:scale-95'
                    }`}
                  >
                      {node.isGenerating ? <Loader2 size={12} className="animate-spin text-white/50" /> : <ArrowUp size={14} className="text-white" strokeWidth={3} />}
                  </button>
              </div>

              <div 
                className="bg-[#151515] border-t border-white/5 px-3 py-1.5 flex items-center justify-center cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              >
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Settings2 size={10} />
                      {getText('advSettings')}
                      {isAdvancedOpen ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
                  </span>
              </div>
              
              {isAdvancedOpen && (
                  <div className="bg-[#151515] p-3 border-t border-white/5 text-[10px] text-gray-500 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                      <div className="flex justify-between items-center"><span>Negative Prompt</span><span className="text-xs">+</span></div>
                      <div className="flex justify-between items-center"><span>Seed</span><span>-1</span></div>
                      <div className="flex justify-between items-center"><span>Steps</span><span>20</span></div>
                  </div>
              )}
          </div>
      )
  };

  const ImagePreviewToolbar = () => (
    <div 
        className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center h-10 w-auto min-w-max whitespace-nowrap bg-[#1a1a1a] border border-white/10 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 px-3" 
        onClick={(e) => e.stopPropagation()}
    >
        <div className="flex items-center gap-1">
            <button onClick={handlePromptButtonClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-[10px] font-medium text-gray-300 hover:text-white transition-all">
                <Sparkles size={12} /><span>{getText('aiPrompt')}</span>
            </button>
            <button onClick={handleAnalyzeClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-[10px] font-medium text-gray-300 hover:text-white transition-all">
                <FileJson size={12} /><span>{getText('analyze')}</span>
            </button>
            <button onClick={handleDnaClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-[10px] font-medium text-blue-400 hover:text-blue-300 transition-all">
                <Dna size={12} /><span>{getText('dna')}</span>
            </button>
            <button onClick={(e) => handleProcessClick(e, 'removeBg')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-[10px] font-medium text-gray-300 hover:text-white transition-all">
                <Eraser size={12} /><span>{getText('removeBg')}</span>
            </button>
            <button onClick={(e) => handleProcessClick(e, 'enhance')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-[10px] font-medium text-gray-300 hover:text-white transition-all">
                <Zap size={12} /><span>{getText('enhance')}</span>
            </button>
            <button onClick={(e) => handleProcessClick(e, 'upscale')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-[10px] font-medium text-gray-300 hover:text-white transition-all">
                <Scaling size={12} /><span>{getText('upscale')}</span>
            </button>
        </div>
        <div className="w-px h-4 bg-white/15 mx-2" />
        <div className="flex items-center gap-1">
             <button onClick={(e) => { e.stopPropagation(); setIsDetailsOpen(!isDetailsOpen); }} className={`p-1.5 rounded-full hover:bg-white/10 transition-all ${isDetailsOpen ? 'text-blue-400 bg-white/10' : 'text-gray-400 hover:text-white'}`}><Info size={14} /></button>
            <button onClick={(e) => handleProcessClick(e, 'crop')} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Crop size={14} /></button>
            <button onClick={handleDownload} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Download size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); setShowFullscreen(true); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Maximize2 size={14} /></button>
        </div>
    </div>
  );

  const PromptToolbar = () => (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center h-10 w-auto min-w-max whitespace-nowrap bg-[#1a1a1a] border border-white/10 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 px-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={(e) => { e.stopPropagation(); if (onTextToImage) onTextToImage(node.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all text-[10px] font-medium">
            <ImageIcon size={12} /><span>{getText('textToImage')}</span>
        </button>
        <div className="w-px h-4 bg-white/15 mx-2" />
        <button onClick={(e) => { e.stopPropagation(); setIsTranslated(!isTranslated); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] font-medium ${isTranslated ? 'bg-white text-black' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
            <Languages size={12} /><span>{isTranslated ? '中文' : 'English'}</span>
        </button>
        <div className="w-px h-4 bg-white/15 mx-2" />
        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(displayedPromptContent); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
             {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
    </div>
  );

  const JsonToolbar = () => (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center h-10 w-auto min-w-max whitespace-nowrap bg-[#1a1a1a] border border-white/10 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 px-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={(e) => { e.stopPropagation(); if (onJsonToImage) onJsonToImage(node.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all text-[10px] font-medium">
            <ImageIcon size={12} /><span>{getText('jsonToImage')}</span>
        </button>
        <div className="w-px h-4 bg-white/15 mx-2" />
        <button onClick={(e) => { e.stopPropagation(); setIsTranslated(!isTranslated); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] font-medium ${isTranslated ? 'bg-white text-black' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
            <Languages size={12} /><span>{isTranslated ? '中文' : 'English'}</span>
        </button>
        <div className="w-px h-4 bg-white/15 mx-2" />
        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(displayedJsonContent); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
             {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
    </div>
  );

  const DetailPopup = () => (
    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-[300px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 z-50">
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{getText('details')}</span>
                <span className="text-[10px] font-mono text-gray-400">{node.meta?.resolution || '...'}</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-medium text-gray-500 uppercase">{getText('filename')}</span>
                <div className="text-[10px] text-gray-300 truncate font-mono select-text" title={node.meta?.fileName}>{node.meta?.fileName || 'untitled.png'}</div>
            </div>
        </div>
    </div>
  );

  // --- CONTENT PREPARATION ---
  let displayedPromptContent = '';
  if (isPromptAnalysis && node.content) {
      let promptAnalysisContent = { en: '', zh: '' };
      try { promptAnalysisContent = JSON.parse(node.content); } catch (e) { promptAnalysisContent = { en: node.content, zh: '' }; }
      displayedPromptContent = isTranslated ? (promptAnalysisContent.zh || promptAnalysisContent.en) : promptAnalysisContent.en;
  }
  let displayedJsonContent = node.content || '{}';
  if (node.type === NodeType.JSON && node.content) {
      try {
          const parsed = JSON.parse(node.content);
          if (parsed && typeof parsed === 'object' && 'en' in parsed && 'zh' in parsed) {
              const target = isTranslated ? parsed.zh : parsed.en;
              displayedJsonContent = typeof target === 'string' ? target : JSON.stringify(target, null, 2);
          }
      } catch (e) {}
  }

  // Common Card Content Renderer (Used by both Generator and Preview)
  const renderCardContent = () => (
    <>
       {node.isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20 gap-3">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <span className="text-xs font-mono text-white/70 animate-pulse">{getText('processing')}...</span>
            </div>
        ) : node.content ? (
            <img src={node.content} alt="Content" className="w-full h-full object-cover pointer-events-none relative z-10" onLoad={handleImageLoad} />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-700 bg-[#0c0c0c]">
                <ImageIcon size={48} strokeWidth={1} />
            </div>
        )}
    </>
  );

  // --- RENDER LOGIC ---

  // Determine Layout Type
  const isImageGenerator = isGenerator; // Defined at top
  const isImagePreview = isPreview; // Defined at top
  const isSpecialCard = node.type === NodeType.JSON || isPromptAnalysis || isDnaAnalysis;
  const isAnyCard = isImageGenerator || isImagePreview || isSpecialCard;

  // Dimensions
  const defaultW = isSpecialCard ? 450 : 320;
  const nodeWidth = node.width ? `${node.width}px` : `${defaultW}px`;
  let nodeHeight = 'auto';
  let nodeAspect = isSpecialCard ? 'auto' : (node.meta?.aspectRatio ? `${node.meta.aspectRatio}` : 'auto');
  
  if (isImageGenerator && !node.meta?.aspectRatio) nodeAspect = '16/9';
  
  if (node.height) { 
    nodeHeight = `${node.height}px`; 
    nodeAspect = 'unset'; 
  } else if (isSpecialCard) {
    nodeHeight = '400px'; // Min height fallback for special cards
    nodeAspect = 'unset';
  }

  if (isAnyCard) {
    return (
      <>
        {showCropEditor && node.content && createPortal(<CropEditor imageSrc={node.content} onConfirm={handleCropConfirm} onCancel={() => setShowCropEditor(false)}/>, document.body)}
        {showFullscreen && node.content && createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200" onClick={() => setShowFullscreen(false)}>
                <button className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-50" onClick={() => setShowFullscreen(false)}><X size={20} /></button>
                <div className="max-w-[95vw] max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
                    <img src={node.content!} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                </div>
            </div>, document.body
        )}

        <div
            ref={nodeRef}
            className="absolute group select-none will-change-transform"
            style={{ 
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                top: 0, left: 0, width: nodeWidth, height: nodeHeight, aspectRatio: nodeAspect,
                zIndex: isSelected ? 50 : undefined 
            }}
            onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        >
            {/* Toolbars */}
            {isSelected && isImageGenerator && <ImageGeneratorPanel />}
            {isSelected && isImagePreview && <ImagePreviewToolbar />}
            {isSelected && isPromptAnalysis && <PromptToolbar />}
            {isSelected && node.type === NodeType.JSON && <JsonToolbar />}

            {/* Title */}
            <div className="absolute -top-8 left-0 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                 <span className={`text-xs font-bold tracking-wide ${isDnaAnalysis ? 'text-blue-400' : 'text-white'}`}>{node.title || (isImageGenerator ? 'Image Generation' : 'Image Preview')}</span>
            </div>

            {/* Card Body */}
            <div className={`relative w-full h-full rounded-[20px] overflow-hidden bg-[#0c0c0c] ${isResizing ? 'transition-none' : 'transition-all duration-300'} ${isSelected ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-900/20' : 'ring-1 ring-white/10 hover:ring-white/30'} ${isDnaAnalysis ? 'border border-blue-500/30 shadow-lg shadow-blue-500/10' : ''}`} onClick={handleImageClick}>
                {/* Checkboard */}
                {!isSpecialCard && <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', backgroundColor: '#111' }} />}
                
                {isSpecialCard ? (
                    <div className={`absolute inset-0 p-4 bg-[#0a0a0a] overflow-auto custom-scrollbar z-10 ${isDnaAnalysis ? 'bg-gradient-to-br from-[#0a0a0a] to-[#0a1120]' : ''}`}>
                        {isDnaAnalysis && (
                            <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                                <Dna size={80} className="text-blue-500" />
                            </div>
                        )}
                        <pre className={`text-xs font-mono whitespace-pre-wrap leading-relaxed select-text cursor-text relative z-20 ${node.type === NodeType.JSON ? 'text-green-400/90' : 'text-gray-300'} ${isDnaAnalysis ? 'text-blue-300/90' : ''}`} onMouseDown={e => e.stopPropagation()}>
                            {node.type === NodeType.JSON ? displayedJsonContent : displayedPromptContent}
                        </pre>
                    </div>
                ) : renderCardContent()}

                {/* Upload Button */}
                {isImagePreview && node.prompt === 'Uploaded source file' && (
                    <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); onUploadTrigger(node.id); }} className="p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-colors"><Upload size={14} /></button>
                    </div>
                )}
            </div>

            {/* Resize Handle */}
            <div data-resizer="true" className="absolute -bottom-2 -right-2 w-8 h-8 z-50 flex items-end justify-end cursor-nwse-resize group/resizer opacity-0 group-hover:opacity-100 transition-opacity" onMouseDown={handleResizeMouseDown}>
                 <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>

            {/* Popups */}
            {isSelected && isImagePreview && isDetailsOpen && <DetailPopup />}

            {/* Input Handle */}
            {(!isPreview || node.prompt !== 'Uploaded source file') && (
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 flex items-center justify-center w-6 h-6 z-40" onMouseUp={(e) => { if (onConnectEnd) { e.stopPropagation(); onConnectEnd(node.id); }}}>
                     <div className="w-2.5 h-2.5 rounded-full border border-gray-500 bg-[#1a1a1a] hover:bg-white hover:border-white transition-all cursor-crosshair"></div>
                </div>
            )}

            {/* Output Handle */}
            <div className="absolute top-1/2 -right-3 -translate-y-1/2 flex items-center justify-center w-6 h-6 z-40" onMouseDown={(e) => { if (onConnectStart) { e.stopPropagation(); onConnectStart(node.id); }}}>
                 <div className="w-2.5 h-2.5 rounded-full border border-gray-500 bg-[#1a1a1a] hover:bg-white hover:border-white transition-all cursor-crosshair"></div>
            </div>
        </div>
      </>
    );
  }

  // --- STANDARD NODE RENDER (VIDEO, AUDIO, TEXT) ---
  const getIcon = () => {
    switch (node.type) {
      case NodeType.TEXT: return <FileText size={16} className="text-gray-400" />;
      case NodeType.VIDEO: return <Video size={16} className="text-gray-400" />;
      case NodeType.AUDIO: return <Music size={16} className="text-gray-400" />;
      default: return <Type size={16} className="text-gray-400" />;
    }
  };

  const getBorderColor = () => {
    if (isSelected) return 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]';
    return 'border-white/10 hover:border-white/30';
  };

  const renderStandardContent = () => {
    if (node.isGenerating) {
      return (
        <div className="h-48 flex flex-col items-center justify-center gap-3 bg-black/20 rounded-lg mx-2 mb-2">
          <Loader2 className="animate-spin text-gray-400" size={28} />
          <span className="text-xs font-mono text-gray-400 animate-pulse">{getText('processing')}...</span>
        </div>
      );
    }
    if (node.content) {
      return (
        <div className="relative group/content">
            {node.type === NodeType.TEXT && <div className="p-3 bg-black/30 text-sm text-gray-200 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto rounded-lg mx-2 mb-2 border border-white/5">{node.content}</div>}
            {node.type === NodeType.VIDEO && (
                <div className="relative mx-2 mb-2 rounded-lg overflow-hidden border border-white/5 bg-black/50">
                <video src={node.content} controls className="w-full h-auto max-h-64" />
                </div>
            )}
            {node.type === NodeType.AUDIO && (
                <div className="mx-2 mb-2 p-3 bg-black/30 rounded-lg border border-white/5 flex items-center justify-center">
                <audio src={node.content} controls className="w-full" />
                </div>
            )}
        </div>
      );
    }
    return (
      <div className="px-3 pb-3 relative">
         <textarea ref={textareaRef} value={localPrompt} onChange={handlePromptChange} onKeyDown={(e) => { e.stopPropagation(); }} placeholder={`${getText('describePrefix')} ${getTypeLabel()}${getText('describeSuffix')}`} className="w-full h-24 bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-[#0f0f0f] resize-none transition-all" />
      </div>
    );
  };

  return (
    <div ref={nodeRef} className={`absolute w-80 bg-[#141414]/95 backdrop-blur-xl rounded-2xl border flex flex-col group will-change-transform ${getBorderColor()}`} style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)`, top: 0, left: 0, transitionProperty: 'box-shadow, border-color, background-color', transitionDuration: '200ms', boxShadow: isSelected ? '0 10px 40px -10px rgba(0,0,0,0.8)' : '0 4px 20px -5px rgba(0,0,0,0.5)' }} onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}>
      <div className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-white/5 border border-white/5">{getIcon()}</div>
          <div className="flex flex-col"><span className="text-xs font-bold text-gray-200 tracking-wide uppercase">{getTypeLabel()}</span><span className="text-[10px] text-gray-500 font-mono">ID: {node.id.slice(0,4)}</span></div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"><X size={14} /></button>
      </div>
      {renderStandardContent()}
      <div className="p-3 pt-0 flex gap-2">
        {!node.content ? (
             <button onClick={handleGenerateClick} disabled={node.isGenerating || !localPrompt.trim()} className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all ${!localPrompt.trim() ? 'opacity-50 cursor-not-allowed bg-white/5 text-gray-500' : 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/5'}`}>
                <Wand2 size={14} />{getText('generate')}
             </button>
        ) : (
             <div className="flex w-full gap-2">
                 <button onClick={handleGenerateClick} disabled={node.isGenerating} className="flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5 transition-all"><RefreshCw size={14} />{getText('regenerate')}</button>
                 {node.type !== NodeType.TEXT && <button className="py-2 px-3 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"><Play size={14} fill="currentColor" /></button>}
             </div>
        )}
      </div>
      <div className="absolute top-1/2 -left-16 -translate-y-1/2 flex items-center justify-center w-12 h-full z-20 pointer-events-none" onMouseUp={(e) => { if (onConnectEnd) { e.stopPropagation(); onConnectEnd(node.id); }}}><div className="w-5 h-5 rounded-full border border-white/20 bg-[#1a1a1a] text-gray-400 flex items-center justify-center pointer-events-auto cursor-crosshair opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:border-white/50 hover:text-white shadow-xl"><Plus size={10} /></div></div>
      <div className="absolute top-1/2 -right-16 -translate-y-1/2 flex items-center justify-center w-12 h-full z-20 pointer-events-none" onMouseDown={(e) => { if (onConnectStart) { e.stopPropagation(); onConnectStart(node.id); }}}><div className="w-5 h-5 rounded-full border border-white/20 bg-[#1a1a1a] text-gray-400 flex items-center justify-center pointer-events-auto cursor-crosshair opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:border-white/50 hover:text-white shadow-xl"><Plus size={10} /></div></div>
    </div>
  );
};

export const NodeUI = memo(NodeUIComponent);