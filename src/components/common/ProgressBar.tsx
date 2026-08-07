import React from 'react';

interface ProgressBarProps {
  progress: number;
  statusText?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, statusText }) => {
  return (
    <div className="w-full space-y-1.5 font-mono">
      <div className="flex justify-between items-center text-[11px] font-bold text-engine-muted uppercase tracking-wider">
        <span>{statusText || 'PIPELINE_EXECUTION'}</span>
        <span className="text-engine-cyan">{Math.min(100, Math.max(0, progress))}%</span>
      </div>
      <div className="w-full h-1.5 bg-engine-surface border border-engine-border rounded-sm overflow-hidden">
        <div
          className="h-full bg-engine-cyan transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};
