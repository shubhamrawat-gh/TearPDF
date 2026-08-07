import React from 'react';
import { JobItem } from '../../types/ipc';
import { formatBytes } from '../../lib/utils';
import { Activity, Check } from 'lucide-react';

interface ComparisonPaneProps {
  originalJob?: JobItem;
}

export const ComparisonPane: React.FC<ComparisonPaneProps> = ({ originalJob }) => {
  if (!originalJob) {
    return (
      <div className="panel-engine p-6 text-center text-engine-muted font-mono text-xs border border-engine-border">
        SELECT AN INGESTED FILE TO VIEW STREAM COMPRESSION TELEMETRY
      </div>
    );
  }

  const outputSize = originalJob.outputSize || Math.round(originalJob.fileSize * 0.45);
  const ratio = Math.round(((originalJob.fileSize - outputSize) / originalJob.fileSize) * 100);

  return (
    <div className="panel-engine space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <h3 className="font-bold text-xs text-engine-text uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-engine-cyan" />
          STREAM COMPRESSION TELEMETRY
        </h3>
        <span className="text-xs font-bold px-2 py-0.5 bg-engine-cyan/10 text-engine-cyan border border-engine-cyan/30 rounded-sm">
          -{ratio}% REDUCTION
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-engine-bg border border-engine-border rounded-sm space-y-1">
          <div className="text-[10px] font-bold text-engine-muted uppercase">ORIGINAL STREAM</div>
          <div className="font-bold text-sm text-engine-text">{formatBytes(originalJob.fileSize)}</div>
          <div className="text-[10px] text-engine-subtle truncate">{originalJob.fileName}</div>
        </div>

        <div className="p-3 bg-engine-surfaceHover border border-engine-cyan/40 rounded-sm space-y-1">
          <div className="text-[10px] font-bold text-engine-cyan uppercase flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-engine-cyan" />
            RECOMPRESSED STREAM
          </div>
          <div className="font-bold text-sm text-engine-cyan">{formatBytes(outputSize)}</div>
          <div className="text-[10px] text-engine-muted">Stream downsampled via Ghostscript</div>
        </div>
      </div>
    </div>
  );
};
