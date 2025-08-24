export type View = 'editor' | 'chat' | 'preview' | 'copier';

export interface File {
  type: 'file';
  content: string;
}

export interface Directory {
  type: 'directory';
  children: { [key: string]: File | Directory };
}

export type FileSystemNode = File | Directory;
export type FileSystemTree = Directory;

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  type?: 'message' | 'action';
  image?: string;
}

export interface LintError {
  line: number;
  column: number;
  message: string;
  ruleId: string | null;
}