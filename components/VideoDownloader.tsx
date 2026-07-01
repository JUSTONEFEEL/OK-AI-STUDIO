import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Loader2, Video as VideoIcon, CheckCircle2, AlertCircle, Play } from 'lucide-react';

interface VideoItem {
  id: string;
  url: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  width?: number;
  height?: number;
  duration?: number;
}

interface VideoDownloaderProps {
  onClose: () => void;
}

export const VideoDownloader: React.FC<VideoDownloaderProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Auto-parse when input changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      parseLinks(input);
    }, 800);
    return () => clearTimeout(timer);
  }, [input]);

  const parseLinks = (text: string) => {
    // Filter for typical video extensions or any http link if generic
    const urls = text.split(/[\n\s]+/).filter(u => u.trim().match(/^https?:\/\/.+/));
    
    const newVideos: VideoItem[] = urls.map(url => {
      const existing = videos.find(v => v.url === url);
      if (existing) return existing;
      return { id: crypto.randomUUID(), url, status: 'pending' };
    });

    setVideos(newVideos);
    
    // Trigger load for pending
    newVideos.forEach(v => {
      if (v.status === 'pending') {
        loadVideoMetadata(v.id, v.url);
      }
    });
  };

  const loadVideoMetadata = (id: string, url: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'loading' } : v));

    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = "anonymous"; // Attempt anonymous access
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      setVideos(prev => prev.map(v => 
        v.id === id 
        ? { 
            ...v, 
            status: 'success', 
            width: video.videoWidth, 
            height: video.videoHeight, 
            duration: video.duration 
          } 
        : v
      ));
      // Clean up
      video.src = "";
      video.load();
    };

    video.onerror = () => {
      setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'error' } : v));
    };
  };

  const downloadVideo = async (video: VideoItem) => {
    try {
      // 1. Try fetching as blob (Best for user experience if CORS allows)
      const response = await fetch(video.url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      // Extract filename from URL or default
      const filename = video.url.split('/').pop()?.split('?')[0] || `video-${video.id.slice(0,4)}.mp4`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // 2. Fallback: Direct link opening (Browser handles download or plays it)
      console.warn("Blob download failed (likely CORS), falling back to window.open", e);
      window.open(video.url, '_blank');
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    const successVideos = videos.filter(v => v.status === 'success');
    
    // Download sequentially to avoid choking bandwidth
    for (const v of successVideos) {
      await downloadVideo(v);
      await new Promise(r => setTimeout(r, 1000)); // Delay
    }
    setIsDownloadingAll(false);
  };

  const successCount = videos.filter(v => v.status === 'success').length;

  // Helper to format duration
  const formatTime = (seconds?: number) => {
      if (!seconds) return "0:00";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
                    <VideoIcon className="text-purple-500" />
                    Video Batch Downloader
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Paste video links below (mp4, webm, mov).
                </p>
            </div>
            
            <div className="flex-1 p-4">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="https://example.com/video1.mp4&#10;https://example.com/movie.webm"
                    className="w-full h-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed placeholder-gray-700"
                    spellCheck={false}
                />
            </div>

            <div className="p-4 border-t border-white/5 bg-[#121212]">
                <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                    <span>{videos.length} links detected</span>
                    <span>{successCount} ready</span>
                </div>
            </div>
        </div>

        {/* RIGHT: Preview Grid */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Video Gallery</span>
                
                <button 
                    onClick={handleDownloadAll}
                    disabled={successCount === 0 || isDownloadingAll}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                        successCount > 0 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                >
                    {isDownloadingAll ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isDownloadingAll ? 'Downloading...' : 'Download All'}
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {videos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                            <VideoIcon size={32} />
                        </div>
                        <p className="text-sm">No videos to display</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {videos.map(v => (
                            <div key={v.id} className="group relative aspect-video bg-[#151515] rounded-xl border border-white/5 overflow-hidden">
                                {v.status === 'loading' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-purple-500" size={24} />
                                    </div>
                                )}
                                
                                {v.status === 'error' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500/50 gap-2">
                                        <AlertCircle size={24} />
                                        <span className="text-[10px] font-mono">Failed to load</span>
                                    </div>
                                )}

                                {v.status === 'success' && (
                                    <>
                                        <video 
                                            src={v.url} 
                                            className="w-full h-full object-cover" 
                                            controls 
                                            muted // Muted by default to avoid chaos
                                            preload="metadata"
                                        />
                                        
                                        {/* Info Overlay (Visible on Hover) */}
                                        <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-start pointer-events-none">
                                            <div className="px-2 py-1 bg-black/50 rounded text-[10px] font-mono text-gray-300 border border-white/10 backdrop-blur-sm">
                                                {v.width}x{v.height}
                                            </div>
                                            <div className="px-2 py-1 bg-black/50 rounded text-[10px] font-mono text-gray-300 border border-white/10 backdrop-blur-sm">
                                                {formatTime(v.duration)}
                                            </div>
                                        </div>

                                        {/* Download Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                             <button 
                                                onClick={(e) => { e.preventDefault(); downloadVideo(v); }}
                                                className="pointer-events-auto p-3 bg-white text-black rounded-full hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                                                title="Download Video"
                                            >
                                                <Download size={20} />
                                            </button>
                                        </div>

                                        {/* Success Badge */}
                                        <div className="absolute bottom-2 right-2 text-green-500 bg-black/50 rounded-full p-0.5 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
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