import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, Crop as CropIcon, ZoomIn, Maximize, LayoutTemplate } from 'lucide-react';

interface CropEditorProps {
  imageSrc: string;
  onConfirm: (croppedImage: string) => void;
  onCancel: () => void;
}

const CropEditor: React.FC<CropEditorProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Natural image dimensions
  const [natSize, setNatSize] = useState({ w: 0, h: 0 });
  
  // Display scale (how much the image is shrunk/grown to fit screen)
  const [scale, setScale] = useState(1);
  
  // Crop Box State (in Natural Image Pixels)
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null); // null = move box, 'nw', 'se', etc.
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startCrop, setStartCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // Initialize on image load
  const onImageLoad = () => {
    if (imgRef.current && containerRef.current) {
      const nw = imgRef.current.naturalWidth;
      const nh = imgRef.current.naturalHeight;
      setNatSize({ w: nw, h: nh });

      // Calculate fit scale
      const cw = containerRef.current.clientWidth - 80; // Padding
      const ch = containerRef.current.clientHeight - 80;
      const s = Math.min(cw / nw, ch / nh, 1); // Don't upscale beyond 1x initially usually, but for zoom we might
      setScale(s);

      // Default Crop: Center 80%
      const cropW = Math.floor(nw * 0.8);
      const cropH = Math.floor(nh * 0.8);
      setCrop({
        x: Math.floor((nw - cropW) / 2),
        y: Math.floor((nh - cropH) / 2),
        w: cropW,
        h: cropH
      });
    }
  };

  // --- Interaction Handlers ---

  const handleMouseDown = (e: React.MouseEvent, handle: string | null) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartCrop({ ...crop });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const dx = (e.clientX - startPos.x) / scale;
    const dy = (e.clientY - startPos.y) / scale;

    let newCrop = { ...startCrop };

    // Helper to ensure integer values
    const toInt = (val: number) => Math.round(val);

    if (dragHandle === null) {
      // Moving the box
      // Calculate float position first, then round for display/data
      const rawX = startCrop.x + dx;
      const rawY = startCrop.y + dy;
      
      newCrop.x = toInt(Math.max(0, Math.min(natSize.w - newCrop.w, rawX)));
      newCrop.y = toInt(Math.max(0, Math.min(natSize.h - newCrop.h, rawY)));
    } else {
      // Resizing
      // We apply rounding to the dimensions and position to keep pixels clean
      
      if (dragHandle.includes('e')) {
          newCrop.w = toInt(Math.min(natSize.w - startCrop.x, Math.max(10, startCrop.w + dx)));
      }
      if (dragHandle.includes('s')) {
          newCrop.h = toInt(Math.min(natSize.h - startCrop.y, Math.max(10, startCrop.h + dy)));
      }
      if (dragHandle.includes('w')) {
        const maxDelta = startCrop.w - 10;
        // Ensure we don't drag past left edge (x < 0)
        const delta = Math.min(maxDelta, Math.max(-startCrop.x, dx));
        newCrop.x = toInt(startCrop.x + delta);
        newCrop.w = toInt(startCrop.w - delta);
      }
      if (dragHandle.includes('n')) {
        const maxDelta = startCrop.h - 10;
        // Ensure we don't drag past top edge (y < 0)
        const delta = Math.min(maxDelta, Math.max(-startCrop.y, dy));
        newCrop.y = toInt(startCrop.y + delta);
        newCrop.h = toInt(startCrop.h - delta);
      }
    }

    setCrop(newCrop);
  }, [isDragging, dragHandle, startPos, scale, startCrop, natSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // --- Output Generation ---

  const handleConfirm = () => {
    const canvas = document.createElement('canvas');
    canvas.width = crop.w;
    canvas.height = crop.h;
    const ctx = canvas.getContext('2d');
    if (ctx && imgRef.current) {
        ctx.drawImage(
            imgRef.current,
            crop.x, crop.y, crop.w, crop.h, // Source rect
            0, 0, crop.w, crop.h            // Dest rect
        );
        onConfirm(canvas.toDataURL('image/png'));
    }
  };

  // Input changes
  const handleInputChange = (key: keyof typeof crop, val: string) => {
      // Force Integer
      const num = Math.round(parseFloat(val) || 0);
      setCrop(prev => ({ ...prev, [key]: num }));
  };

  // Apply Aspect Ratio Presets
  const applyAspectRatio = (ratioW: number, ratioH: number) => {
      const { w: nw, h: nh } = natSize;
      const targetRatio = ratioW / ratioH;
      const imgRatio = nw / nh;

      let newW, newH;

      if (imgRatio > targetRatio) {
          // Image is wider than target ratio, fit to height
          newH = nh;
          newW = nh * targetRatio;
      } else {
          // Image is taller than target ratio, fit to width
          newW = nw;
          newH = nw / targetRatio;
      }

      // Slightly scale down (90%) so it doesn't touch edges immediately, nicer UX
      newW = Math.floor(newW * 0.9);
      newH = Math.floor(newH * 0.9);

      setCrop({
          w: Math.round(newW),
          h: Math.round(newH),
          x: Math.round((nw - newW) / 2),
          y: Math.round((nh - newH) / 2)
      });
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/95 flex text-white animate-in fade-in duration-200">
        
        {/* Main Work Area */}
        <div ref={containerRef} className="flex-1 relative flex items-center justify-center overflow-hidden p-10 cursor-move" onMouseDown={(e) => {
             // Drag pan logic for image could go here, but let's stick to simple centering for now
        }}>
            {/* Image Container */}
            <div 
                className="relative shadow-2xl"
                style={{ 
                    width: natSize.w * scale, 
                    height: natSize.h * scale,
                }}
            >
                <img 
                    ref={imgRef}
                    src={imageSrc} 
                    onLoad={onImageLoad}
                    alt="Source" 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none select-none opacity-50 grayscale-[50%]"
                    draggable={false}
                />

                {/* Clear Highlighting Area (The Crop View) */}
                <div 
                    className="absolute overflow-hidden"
                    style={{
                        left: crop.x * scale,
                        top: crop.y * scale,
                        width: crop.w * scale,
                        height: crop.h * scale,
                    }}
                >
                    <img 
                        src={imageSrc} 
                        className="absolute max-w-none"
                        style={{
                            width: natSize.w * scale,
                            height: natSize.h * scale,
                            left: -crop.x * scale,
                            top: -crop.y * scale
                        }} 
                    />
                </div>

                {/* Crop UI Overlay */}
                <div 
                    className="absolute border border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move"
                    style={{
                        left: crop.x * scale,
                        top: crop.y * scale,
                        width: crop.w * scale,
                        height: crop.h * scale,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, null)}
                >
                     {/* Grid Lines */}
                     <div className="absolute inset-0 flex flex-col">
                        <div className="flex-1 border-b border-white/20"></div>
                        <div className="flex-1 border-b border-white/20"></div>
                        <div className="flex-1"></div>
                     </div>
                     <div className="absolute inset-0 flex">
                        <div className="flex-1 border-r border-white/20"></div>
                        <div className="flex-1 border-r border-white/20"></div>
                        <div className="flex-1"></div>
                     </div>

                     {/* Handles */}
                     {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(h => (
                         <div 
                            key={h}
                            className={`absolute w-3 h-3 bg-blue-500 border border-white z-10 
                                ${h.includes('n') ? 'top-[-6px]' : h.includes('s') ? 'bottom-[-6px]' : 'top-[50%] mt-[-6px]'}
                                ${h.includes('w') ? 'left-[-6px]' : h.includes('e') ? 'right-[-6px]' : 'left-[50%] ml-[-6px]'}
                            `}
                            style={{ 
                                cursor: `${h}-resize`
                            }}
                            onMouseDown={(e) => handleMouseDown(e, h)}
                         />
                     ))}
                     
                     {/* Dimensions Label */}
                     <div className="absolute -top-8 left-0 bg-blue-600 px-2 py-1 rounded text-xs font-mono font-bold shadow-md">
                         {crop.w} x {crop.h}
                     </div>
                </div>
            </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 bg-[#121212] border-l border-white/10 p-6 flex flex-col gap-6 z-10 overflow-y-auto">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                    <CropIcon size={20} className="text-blue-500" />
                    Crop Image
                </h2>
                <p className="text-sm text-gray-500">Adjust crop area visually or via inputs.</p>
            </div>

            <div className="space-y-4 flex-1">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Original Size</label>
                    <div className="text-sm font-mono text-gray-200">{natSize.w} x {natSize.h} px</div>
                </div>

                {/* Aspect Ratio Presets */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                        <LayoutTemplate size={12} />
                        Presets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => applyAspectRatio(1, 1)} className="py-2 bg-white/5 hover:bg-white/10 rounded text-xs border border-white/5 transition-colors">1:1</button>
                        <button onClick={() => applyAspectRatio(16, 9)} className="py-2 bg-white/5 hover:bg-white/10 rounded text-xs border border-white/5 transition-colors">16:9</button>
                        <button onClick={() => applyAspectRatio(4, 3)} className="py-2 bg-white/5 hover:bg-white/10 rounded text-xs border border-white/5 transition-colors">4:3</button>
                        <button onClick={() => applyAspectRatio(9, 16)} className="py-2 bg-white/5 hover:bg-white/10 rounded text-xs border border-white/5 transition-colors">9:16</button>
                        <button onClick={() => applyAspectRatio(3, 4)} className="py-2 bg-white/5 hover:bg-white/10 rounded text-xs border border-white/5 transition-colors">3:4</button>
                        <button onClick={() => applyAspectRatio(21, 9)} className="py-2 bg-white/5 hover:bg-white/10 rounded text-xs border border-white/5 transition-colors">21:9</button>
                    </div>
                </div>

                {/* Manual Inputs */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Custom Dimensions</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Width</label>
                            <input 
                                type="number" 
                                value={crop.w}
                                onChange={(e) => handleInputChange('w', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Height</label>
                            <input 
                                type="number" 
                                value={crop.h}
                                onChange={(e) => handleInputChange('h', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">X</label>
                            <input 
                                type="number" 
                                value={crop.x}
                                onChange={(e) => handleInputChange('x', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Y</label>
                            <input 
                                type="number" 
                                value={crop.y}
                                onChange={(e) => handleInputChange('y', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                         <button 
                            onClick={() => {
                                // Reset to full
                                setCrop({ x: 0, y: 0, w: natSize.w, h: natSize.h });
                            }}
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded text-xs border border-white/5 transition-colors"
                         >
                            <Maximize size={14} className="inline mr-1" /> Full
                         </button>
                         <button 
                            onClick={() => {
                                // Center 50%
                                const w = Math.floor(natSize.w * 0.5);
                                const h = Math.floor(natSize.h * 0.5);
                                setCrop({ x: Math.floor((natSize.w - w)/2), y: Math.floor((natSize.h - h)/2), w, h });
                            }}
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded text-xs border border-white/5 transition-colors"
                         >
                            <ZoomIn size={14} className="inline mr-1" /> Center
                         </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-white/10">
                 <button 
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleConfirm}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                 >
                    <Check size={18} />
                    Confirm
                 </button>
            </div>
        </div>
    </div>
  );
};

export default CropEditor;
