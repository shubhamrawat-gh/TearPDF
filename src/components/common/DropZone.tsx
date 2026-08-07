import React, { useRef, useState } from 'react';
import { Upload, FileCode, HardDrive } from 'lucide-react';
import { useJobStore } from '../../stores/useJobStore';

interface DropZoneProps {
  acceptType?: 'pdf' | 'image' | 'both';
  title?: string;
  subtitle?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  acceptType = 'both',
  title = 'DROP INPUT FILES TO ENQUEUE PROCESSING PIPELINE',
  subtitle = 'Zero-buffer streaming ingestion engine • Direct file system handle access',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addJobs } = useJobStore();

  const handleFiles = (fileList: FileList) => {
    const validFiles: { path: string; name: string; size: number; type: 'pdf' | 'image' }[] = [];

    Array.from(fileList).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isPdf = ext === 'pdf';
      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'bmp', 'ico'].includes(ext || '');

      if (acceptType === 'pdf' && !isPdf) return;
      if (acceptType === 'image' && !isImage) return;
      if (!isPdf && !isImage) return;

      const filePath = (file as any).path || file.name;

      validFiles.push({
        path: filePath,
        name: file.name,
        size: file.size,
        type: isPdf ? 'pdf' : 'image',
      });
    });

    if (validFiles.length > 0) {
      addJobs(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`w-full border border-dashed rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer transition-colors font-mono ${
        isDragOver
          ? 'border-engine-cyan bg-engine-surfaceHover text-engine-cyan'
          : 'border-engine-border bg-engine-surface hover:border-engine-text text-engine-muted'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={
          acceptType === 'pdf'
            ? '.pdf'
            : acceptType === 'image'
            ? '.jpg,.jpeg,.png,.webp,.avif,.tiff,.bmp,.ico'
            : '.pdf,.jpg,.jpeg,.png,.webp,.avif,.tiff,.bmp,.ico'
        }
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />

      <div className="flex items-center space-x-3 mb-2 text-engine-cyan">
        <Upload className="w-5 h-5" />
        <span className="font-bold text-xs tracking-wider uppercase text-engine-text">{title}</span>
      </div>

      <p className="text-[11px] text-engine-muted text-center max-w-lg mb-3">{subtitle}</p>

      <div className="flex items-center space-x-6 text-[10px] text-engine-subtle border-t border-engine-border pt-3 w-full justify-center">
        <span className="flex items-center space-x-1.5">
          <FileCode className="w-3 h-3 text-engine-cyan" />
          <span>MAGIC_BYTES: %PDF-, \xFF\xD8\xFF, \x89PNG</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <HardDrive className="w-3 h-3 text-engine-amber" />
          <span>STREAM_INGEST: DIRECT_FS_HANDLE</span>
        </span>
      </div>
    </div>
  );
};
