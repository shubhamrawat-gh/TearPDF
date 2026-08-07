export type ToolCategory = 'pdf' | 'image' | 'batch' | 'automation' | 'ai';

export type ToolId = 
  | 'compress-pdf'
  | 'merge-split-pdf'
  | 'rotate-pdf'
  | 'encrypt-pdf'
  | 'repair-pdf'
  | 'resize-images'
  | 'dpi-tool'
  | 'format-convert'
  | 'batch-queue'
  | 'local-ocr'
  | 'semantic-search'
  | 'workflow-builder';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  badge?: string;
}
