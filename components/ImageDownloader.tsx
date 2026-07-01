import React, { useState, useEffect } from 'react';
import { X, Download, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface ImageItem {
  id: string;
  url: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  width?: number;
  height?: number;
  blobUrl?: string; // For downloading
}

interface ImageDownloaderProps {
  onClose: () => void;
}

export const ImageDownloader: React.FC<ImageDownloaderProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Auto-parse when input changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      parseLinks(input);
    }, 800);
    return () => clearTimeout(timer);
  }, [input]);

  const parseLinks = (text: string) => {
    const urls = text.split(/[\n\s]+/).filter(u => u.trim().match(/^https?:\/\/.+/));
    
    // Merge with existing images to avoid reloading if URL hasn't changed, 
    // but here we simply rebuild for simplicity or check duplicates.
    // For a cleaner UX, let's filter out new ones.
    
    const newImages: ImageItem[] = urls.map(url => {
      const existing = images.find(img => img.url === url);
      if (existing) return existing;
      return { id: crypto.randomUUID(), url, status: 'pending' };
    });

    setImages(newImages);
    
    // Trigger load for pending
    newImages.forEach(img => {
      if (img.status === 'pending') {
        loadImage(img.id, img.url);
      }
    });
  };

  const loadImage = (id: string, url: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'loading' } : img));

    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous"; // Try CORS
    imgObj.src = url;

    imgObj.onload = () => {
      setImages(prev => prev.map(img => 
        img.id === id 
        ? { ...img, status: 'success', width: imgObj.naturalWidth, height: imgObj.naturalHeight } 
        : img
      ));
    };

    imgObj.onerror = () => {
      setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'error' } : img));
    };
  };

  const downloadImage = async (img: ImageItem) => {
    try {
      // 1. Try fetching as blob for proper download filename handling
      const response = await fetch(img.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      // Extract filename from URL or default
      const filename = img.url.split('/').pop()?.split('?')[0] || `image-${img.id.slice(0,4)}.png`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback: Direct link opening
      window.open(img.url, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    const successImages = images.filter(i => i.status === 'success');
    
    // Download sequentially to avoid browser blocking
    for (const img of successImages) {
      await downloadImage(img);
      await new Promise(r => setTimeout(r, 500)); // Delay
    }
    setIsDownloadingAll(false);
  };

  const successCount = images.filter(i => i.status === 'success').length;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#050505]/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
      
      <div className="w-[90vw] h-[85vh] bg-[#121212] border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden relative">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all z-50"
        >
            <X size={20} />
        </button>

        {/* LEFT: Input Area */}
        <div className="w-1/3 min-w-[300px] border-r border-white/10 flex flex-col bg-[#0f0f0f]">
            <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Download className="text-blue-500" />
                    Batch Downloader
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Paste image links below (one per line).
                </p>
            </div>
            
            <div className="flex-1 p-4">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="https://example.com/image1.png&#10;https://example.com/image2.jpg"
                    className="w-full h-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed placeholder-gray-700"
                    spellCheck={false}
                />
            </div>

            <div className="p-4 border-t border-white/5 bg-[#121212]">
                <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                    <span>{images.length} links detected</span>
                    <span>{successCount} ready</span>
                </div>
            </div>
        </div>

        {/* RIGHT: Preview Grid */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Preview Gallery</span>
                
                <button 
                    onClick={handleDownloadAll}
                    disabled={successCount === 0 || isDownloadingAll}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                        successCount > 0 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                >
                    {isDownloadingAll ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isDownloadingAll ? 'Downloading...' : 'Download All'}
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {images.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                            <ImageIcon size={32} />
                        </div>
                        <p className="text-sm">No images to display</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map(img => (
                            <div key={img.id} className="group relative aspect-square bg-[#151515] rounded-xl border border-white/5 overflow-hidden">
                                {img.status === 'loading' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-blue-500" size={24} />
                                    </div>
                                )}
                                
                                {img.status === 'error' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500/50 gap-2">
                                        <AlertCircle size={24} />
                                        <span className="text-[10px] font-mono">Failed</span>
                                    </div>
                                )}

                                {img.status === 'success' && (
                                    <>
                                        <img src={img.url} className="w-full h-full object-cover" alt="preview" />
                                        
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                            <div className="px-2 py-1 bg-black/50 rounded text-[10px] font-mono text-gray-300 border border-white/10">
                                                {img.width} x {img.height}
                                            </div>
                                            <button 
                                                onClick={() => downloadImage(img)}
                                                className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>

                                        {/* Success Badge */}
                                        <div className="absolute top-2 right-2 text-green-500 bg-black/50 rounded-full p-0.5 opacity-100 group-hover:opacity-0 transition-opacity">
                                            <CheckCircle2 size={14} fill="currentColor" className="text-black" />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};