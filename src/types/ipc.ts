export interface JobItem {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'image';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputSize?: number;
  outputPath?: string;
  error?: string;
  params?: Record<string, unknown>;
}

export interface BatchProgressPayload {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentFile?: string;
  completedCount: number;
  totalCount: number;
  error?: string;
}

export interface ImageResizeParams {
  width?: number;
  height?: number;
  quality: number;
  format: 'jpg' | 'png' | 'webp' | 'avif' | 'tiff' | 'bmp' | 'ico';
  preserveExif: boolean;
  filter: 'lanczos3' | 'catmullrom' | 'bicubic';
}

export interface ImageDpiParams {
  targetDpi: number;
  mode: 'metadata' | 'resample';
}

export interface PdfCompressParams {
  preset: 'screen' | 'ebook' | 'printer' | 'prepress' | 'grayscale';
  jpegQuality?: number;
  dpi?: number;
}

export interface PdfSplitParams {
  pageRanges: string; // e.g. "1-5, 8, 10-end"
}

export interface PdfRotateParams {
  degrees: 90 | 180 | 270;
}

export interface PdfEncryptParams {
  userPassword?: string;
  ownerPassword?: string;
}

export interface PdfPreviewRequest {
  pdfPath: string;
  pageNumber: number;
  maxWidth?: number;
}

export interface PdfPreviewResponse {
  pageNumber: number;
  totalPages: number;
  width: number;
  height: number;
  base64Image: string;
}
