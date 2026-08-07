import React from 'react';
import { FileText, Image as ImageIcon, X, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { JobItem } from '../../types/ipc';
import { formatBytes } from '../../lib/utils';

interface FileCardProps {
  job: JobItem;
  onRemove?: (id: string) => void;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({ job, onRemove, onSelect, isSelected }) => {
  const savedBytes = job.outputSize ? job.fileSize - job.outputSize : 0;
  const ratio = job.outputSize ? Math.round((savedBytes / job.fileSize) * 100) : 0;

  return (
    <div
      onClick={() => onSelect?.(job.id)}
      className={`bg-engine-surface border p-3 flex items-center justify-between cursor-pointer transition-all font-mono rounded-sm ${
        isSelected ? 'border-engine-cyan bg-engine-surfaceHover' : 'border-engine-border hover:border-engine-text'
      }`}
    >
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-7 h-7 bg-engine-bg border border-engine-border flex items-center justify-center flex-shrink-0 text-engine-cyan">
          {job.fileType === 'pdf' ? (
            <FileText className="w-3.5 h-3.5 text-engine-cyan" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-engine-amber" />
          )}
        </div>

        <div className="min-w-0 text-xs">
          <div className="font-bold text-engine-text truncate">{job.fileName}</div>
          <div className="flex items-center space-x-3 text-[10px] text-engine-muted mt-0.5">
            <span>RAW: <span className="text-engine-text font-bold">{formatBytes(job.fileSize)}</span></span>
            {job.outputSize && (
              <>
                <span>→</span>
                <span>OUT: <span className="text-engine-cyan font-bold">{formatBytes(job.outputSize)}</span></span>
                <span className="text-engine-green font-bold">[-{ratio}%]</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 font-mono text-[11px]">
        {job.status === 'processing' && (
          <div className="flex items-center space-x-1.5 text-engine-amber font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{job.progress}%</span>
          </div>
        )}
        {job.status === 'completed' && (
          <div className="flex items-center space-x-1 text-engine-green font-bold">
            <Check className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase">DONE</span>
          </div>
        )}
        {job.status === 'failed' && (
          <div className="flex items-center space-x-1 text-engine-red font-bold" title={job.error}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase">ERR</span>
          </div>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(job.id);
            }}
            className="text-engine-subtle hover:text-engine-text p-1 hover:bg-engine-border rounded-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
