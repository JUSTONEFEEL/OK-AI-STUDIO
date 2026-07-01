export enum NodeType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  JSON = 'JSON'
}

export interface NodeData {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width?: number; // Defaults to 320px
  height?: number; // Dynamic based on content
  title: string;
  content: string | null; // Text content or Base64 Image/Video URL
  prompt?: string;
  isGenerating: boolean;
  meta?: any; // Extra data like aspect ratio, seed, etc.
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  nodeId: string | null; // If null, dragging canvas
  startX: number;
  startY: number;
}

export type Lang = 'zh' | 'en';

// Global interface for Veo Key Selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}