export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface DiagramState {
  code: string;
  error: string | null;
  lastUpdated: number;
}

export type ViewMode = 'split' | 'code' | 'preview';