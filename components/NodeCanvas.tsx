import React, { useRef, useState, useEffect, useMemo } from 'react';
import { NodeData, Connection, Lang } from '../types';
import { NodeUI } from './NodeUI';
import type { ProcessType } from './NodeUI';

interface NodeCanvasProps {
  nodes: NodeData[];
  connections: Connection[];
  selectedNodeId: string | null;
  onNodeMove: (id: string, x: number, y: number) => void;
  onNodeSelect: (id: string) => void;
  onNodeDelete: (id: string) => void;
  onNodeUpdate: (id: string, updates: Partial<NodeData>) => void;
  onNodeGenerate: (id: string) => void;
  onCanvasClick: () => void;
  language: Lang;
  onUploadTrigger: (nodeId?: string) => void;
  onProcess?: (nodeId: string, type: ProcessType, payload?: any) => void;
  onAnalyze?: (nodeId: string) => void;
  onAnalyzePrompt?: (nodeId: string) => void;
  onDnaAnalyze?: (nodeId: string) => void;
  onTextToImage?: (nodeId: string) => void;
  onJsonToImage?: (nodeId: string) => void;
  onConnect?: (fromId: string, toId: string) => void;
}

const NodeCanvas: React.FC<NodeCanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  onNodeMove,
  onNodeSelect,
  onNodeDelete,
  onNodeUpdate,
  onNodeGenerate,
  onCanvasClick,
  language,
  onUploadTrigger,
  onProcess,
  onAnalyze,
  onAnalyzePrompt,
  onDnaAnalyze,
  onTextToImage,
  onJsonToImage,
  onConnect
}) => {
  // Canvas View State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  
  // Node Drag State (Local optimization to prevent global re-renders)
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });

  // Connection Drag State
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [dragMousePos, setDragMousePos] = useState({ x: 0, y: 0 });
  
  // Refs for tracking mouse movement without triggering renders until rAF
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 }); // Mouse screen pos at drag start
  const lastMousePosRef = useRef({ x: 0, y: 0 }); // Previous mouse pos for panning
  const rAF = useRef<number | null>(null);
  
  // Refs to hold current transform for event listeners
  const transformRef = useRef({ pan, scale });

  // Update refs when state changes
  useEffect(() => {
    transformRef.current = { pan, scale };
  }, [pan, scale]);

  // Derived state: Combine props nodes with local drag offset for smooth rendering
  const displayNodes = useMemo(() => {
    if (!dragNodeId) return nodes;
    return nodes.map(node => {
        if (node.id === dragNodeId) {
            return { 
                ...node, 
                x: node.x + dragDelta.x, 
                y: node.y + dragDelta.y 
            };
        }
        return node;
    });
  }, [nodes, dragNodeId, dragDelta]);

  // Handle Zoom (Ctrl + Wheel)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
        e.preventDefault(); 
        
        if (e.ctrlKey) {
            const { pan: currentPan, scale: currentScale } = transformRef.current;
            const rect = canvas.getBoundingClientRect();
            
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const zoomSensitivity = 0.05;
            const direction = e.deltaY < 0 ? 1 : -1;
            const factor = Math.exp(direction * zoomSensitivity);
            
            const newScale = Math.min(Math.max(0.1, currentScale * factor), 5);
            
            const newPanX = mouseX - (newScale / currentScale) * (mouseX - currentPan.x);
            const newPanY = mouseY - (newScale / currentScale) * (mouseY - currentPan.y);

            setScale(newScale);
            setPan({ x: newPanX, y: newPanY });
        } else {
            setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
        }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []); 

  // --- Interaction Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Left click on background
    if (e.button === 1 || (e.button === 0 && e.target === e.currentTarget)) {
      setIsDraggingCanvas(true);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
    
    // Only clear selection if clicking directly on canvas background
    if (e.target === e.currentTarget) {
        onCanvasClick();
    }
  };

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    // Ignore drag if clicking interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = 
      ['TEXTAREA', 'INPUT', 'BUTTON'].includes(target.tagName) || 
      target.closest('button') ||
      target.tagName === 'PRE' || // Allow selection in pre tag
      target.closest('pre') || // Allow selection in pre tag
      target.dataset.resizer === 'true'; // Allow dragging on resize handle

    if (isInteractive) return;

    // Start Dragging
    setDragNodeId(nodeId);
    setDragDelta({ x: 0, y: 0 });
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    
    onNodeSelect(nodeId);
  };

  const handleConnectStart = (nodeId: string) => {
      setConnectingNodeId(nodeId);
      // Initialize dragMousePos roughly at start to prevent jump
      // We will update it in mouse move immediately anyway
  };

  const handleConnectEnd = (nodeId: string) => {
      if (connectingNodeId && onConnect) {
          onConnect(connectingNodeId, nodeId);
      }
      setConnectingNodeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (connectingNodeId) {
        // Track connection line
        // Convert screen coordinates to world coordinates
        // world = (screen - pan) / scale
        if (!rAF.current) {
            rAF.current = requestAnimationFrame(() => {
                const wx = (clientX - pan.x) / scale;
                const wy = (clientY - pan.y) / scale;
                setDragMousePos({ x: wx, y: wy });
                rAF.current = null;
            });
        }
    } else if (dragNodeId) {
        // Use requestAnimationFrame to throttle UI updates
        if (!rAF.current) {
            rAF.current = requestAnimationFrame(() => {
                const dx = (clientX - dragStartRef.current.x) / scale;
                const dy = (clientY - dragStartRef.current.y) / scale;
                setDragDelta({ x: dx, y: dy });
                rAF.current = null;
            });
        }
    } else if (isDraggingCanvas) {
        const deltaX = clientX - lastMousePosRef.current.x;
        const deltaY = clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: clientX, y: clientY };
        
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    }
  };

  const handleMouseUp = () => {
    // Commit Node Drag
    if (dragNodeId) {
        if (dragDelta.x !== 0 || dragDelta.y !== 0) {
            // Commit final position to global state
            onNodeMove(dragNodeId, dragDelta.x, dragDelta.y);
        }
        setDragNodeId(null);
        setDragDelta({ x: 0, y: 0 });
    }

    // Cancel Connection Drag
    if (connectingNodeId) {
        setConnectingNodeId(null);
    }

    if (rAF.current) {
        cancelAnimationFrame(rAF.current);
        rAF.current = null;
    }

    setIsDraggingCanvas(false);
  };

  // Helper to generate path string
  const generatePath = (x1: number, y1: number, x2: number, y2: number) => {
      // Increase control point distance for smooth curve over wider gap
      const dist = Math.abs(x2 - x1);
      const controlDist = Math.max(dist * 0.5, 100);

      const cp1X = x1 + controlDist;
      const cp2X = x2 - controlDist;
      
      return `M ${x1} ${y1} C ${cp1X} ${y1}, ${cp2X} ${y2}, ${x2} ${y2}`;
  };

  // Memoized Connection Rendering
  const connectionPaths = useMemo(() => {
    return connections.map(conn => {
      const fromNode = displayNodes.find(n => n.id === conn.from);
      const toNode = displayNodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return null;

      const fromW = fromNode.width || (fromNode.type === 'JSON' || fromNode.meta?.isResultCard ? 400 : 320);
      const toW = toNode.width || (toNode.type === 'JSON' || toNode.meta?.isResultCard ? 400 : 320);
      
      const fromH = fromNode.height || 200;
      const toH = toNode.height || 200;
      
      const fromX = fromNode.x + fromW + 64; 
      const fromY = fromNode.y + (fromH / 2); 
      
      const toX = toNode.x - 64;
      const toY = toNode.y + (toH / 2);

      const pathData = generatePath(fromX, fromY, toX, toY);
      
      // Is the connection active? (Data flowing)
      const isActive = toNode.isGenerating;

      return (
        <React.Fragment key={conn.id}>
            {/* Base Wire (The Cable) */}
            <path
              d={pathData}
              stroke={isActive ? "#222" : "#4b5563"}
              strokeWidth="2"
              fill="none"
              className={`transition-colors duration-500 pointer-events-auto cursor-pointer ${!isActive && "hover:stroke-blue-500"}`}
            />
            
            {/* Active Light Flow (Optical Fiber Effect) */}
            {isActive && (
                <path
                    d={pathData}
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="150 2000" // Long pulse (150px) with Huge gap (2000px) prevents segmentation
                    strokeLinecap="round" // Rounded ends + Blur = Gradient-like fade
                    filter="url(#glow-pulse)"
                    className="connection-flow opacity-90 pointer-events-none"
                />
            )}
        </React.Fragment>
      );
    });
  }, [connections, displayNodes]);

  // Temporary Dragging Line
  const draggingPath = useMemo(() => {
      if (!connectingNodeId) return null;
      const fromNode = displayNodes.find(n => n.id === connectingNodeId);
      if (!fromNode) return null;

      const fromW = fromNode.width || (fromNode.type === 'JSON' || fromNode.meta?.isResultCard ? 400 : 320);
      const fromH = fromNode.height || 200;

      const startX = fromNode.x + fromW + 64;
      const startY = fromNode.y + (fromH / 2);
      
      // End point is dragMousePos
      const pathData = generatePath(startX, startY, dragMousePos.x, dragMousePos.y);

      return (
          <path
            d={pathData}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="8 4"
            fill="none"
            className="pointer-events-none opacity-60"
          />
      );
  }, [connectingNodeId, dragMousePos, displayNodes]);

  return (
    <div 
      className={`w-full h-full overflow-hidden bg-[#f0f0f0] dark:bg-[#050505] relative transition-colors duration-300 ${isDraggingCanvas || dragNodeId ? 'cursor-grabbing' : 'cursor-pointer'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      ref={canvasRef}
    >
      <style>{`
        @keyframes flowAnimation {
          from {
            stroke-dashoffset: 3000;
          }
          to {
            stroke-dashoffset: -3000;
          }
        }
        .connection-flow {
          animation: flowAnimation 3s linear infinite; /* Slowed down from 1.5s to 3s */
          pointer-events: none;
        }
      `}</style>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 dot-pattern opacity-20 pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      />

      {/* Nodes and Connections Layer */}
      <div
        className="absolute inset-0 origin-top-left will-change-transform pointer-events-none"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`
        }}
      >
        <svg className="absolute top-0 left-0 w-[50000px] h-[50000px] pointer-events-none overflow-visible">
          <defs>
              {/* Enhanced Glow Filter for Gradient-like tail effect */}
              <filter id="glow-pulse" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="coloredBlur"/> {/* Double blur for stronger glow */}
                      <feMergeNode in="SourceGraphic"/>
                  </feMerge>
              </filter>
          </defs>
          {connectionPaths}
          {draggingPath}
        </svg>

        {displayNodes.map(node => (
          <div
            key={node.id}
            onMouseDown={(e) => handleNodeDragStart(e, node.id)}
            style={{
                zIndex: node.id === dragNodeId ? 100 : undefined
            }}
            className="pointer-events-auto"
          >
            <NodeUI 
              node={node} 
              isSelected={selectedNodeId === node.id}
              onSelect={onNodeSelect}
              onDelete={onNodeDelete}
              onUpdate={onNodeUpdate}
              onGenerate={onNodeGenerate}
              language={language}
              onUploadTrigger={onUploadTrigger}
              onProcess={onProcess}
              onAnalyze={onAnalyze}
              onAnalyzePrompt={onAnalyzePrompt}
              onDnaAnalyze={onDnaAnalyze}
              onTextToImage={onTextToImage}
              onJsonToImage={onJsonToImage}
              onConnectStart={handleConnectStart}
              onConnectEnd={handleConnectEnd}
              scale={scale}
            />
          </div>
        ))}
      </div>
      
      {/* Canvas Info */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono pointer-events-none select-none bg-white/50 dark:bg-black/50 p-2 rounded backdrop-blur-sm border border-black/5 dark:border-white/5">
        X: {pan.x.toFixed(0)} Y: {pan.y.toFixed(0)} | Zoom: {(scale * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default NodeCanvas;