import React, { useState, useEffect } from 'react';
import { NodeData, NodeType } from '../types';
import { Sparkles, Play, Image as ImageIcon, AlignLeft, Info } from 'lucide-react';

interface ControlPanelProps {
  selectedNode: NodeData | null;
  nodes: NodeData[];
  onUpdateNode: (id: string, updates: Partial<NodeData>) => void;
  onGenerate: (id: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ selectedNode, nodes, onUpdateNode, onGenerate }) => {
  const [localPrompt, setLocalPrompt] = useState('');
  
  // Sync prompt when selection changes
  useEffect(() => {
    if (selectedNode) {
      setLocalPrompt(selectedNode.prompt || '');
    }
  }, [selectedNode?.id]);

  // Handle local typing before committing to state on blur/enter (optional, currently direct)
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalPrompt(val);
    if (selectedNode) {
        onUpdateNode(selectedNode.id, { prompt: val });
    }
  };

  if (!selectedNode) {
    return (
      <div className="w-80 border-l border-white/10 bg-[#0c0c0c] p-6 flex flex-col items-center justify-center text-gray-500">
        <Sparkles className="mb-4 opacity-20" size={48} />
        <p className="text-sm">Select a node to edit parameters</p>
      </div>
    );
  }

  const getLabel = () => {
    switch(selectedNode.type) {
        case NodeType.TEXT: return 'Script Generation';
        case NodeType.IMAGE: return 'Visual Creation';
        case NodeType.VIDEO: return 'Video Synthesis';
    }
  };

  const getDescription = () => {
    switch(selectedNode.type) {
        case NodeType.TEXT: return 'Generate creative scripts, ad copy, or storyboards.';
        case NodeType.IMAGE: return 'Create high-fidelity commercial imagery using Gemini Pro.';
        case NodeType.VIDEO: return 'Transform text or images into video using Veo.';
    }
  };

  return (
    <div className="w-80 border-l border-white/10 bg-[#0c0c0c] flex flex-col h-full z-10">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-bold text-gray-200 tracking-wider uppercase flex items-center gap-2">
            {selectedNode.type === NodeType.TEXT && <AlignLeft size={16}/>}
            {selectedNode.type === NodeType.IMAGE && <ImageIcon size={16}/>}
            {selectedNode.type === NodeType.VIDEO && <Play size={16}/>}
            {getLabel()}
        </h2>
        <p className="text-xs text-gray-500 mt-1">{getDescription()}</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">Prompt</label>
            <textarea
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 min-h-[120px] resize-none placeholder-gray-700"
              placeholder={`Describe what you want to generate for this ${selectedNode.type.toLowerCase()}...`}
              value={localPrompt}
              onChange={handlePromptChange}
            />
          </div>

          {/* Context Awareness (Simulated) */}
          {selectedNode.type === NodeType.VIDEO && (
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-blue-400 mt-0.5" />
                <p className="text-xs text-blue-200">
                  Veo requires a paid GCP project. You will be asked to select an API key upon generation.
                </p>
              </div>
            </div>
          )}

           {/* Model Info */}
           <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Model</span>
                    <span className="text-xs font-mono text-gray-300 bg-white/5 px-2 py-0.5 rounded">
                        {selectedNode.type === NodeType.TEXT ? 'Gemini 2.5 Flash' : 
                         selectedNode.type === NodeType.IMAGE ? 'Gemini 3 Pro' : 'Veo 3.1'}
                    </span>
                </div>
           </div>

        </div>
      </div>

      <div className="p-4 border-t border-white/10 bg-[#111]">
        <button
          onClick={() => onGenerate(selectedNode.id)}
          disabled={selectedNode.isGenerating || !localPrompt.trim()}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
            ${selectedNode.isGenerating 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
            }`}
        >
          {selectedNode.isGenerating ? (
            <>Generating...</>
          ) : (
            <>
                <Sparkles size={18} />
                Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;