import React, { useState } from 'react';
import { useJobStore } from '../../stores/useJobStore';
import { DropZone } from '../common/DropZone';
import { FileCard } from '../common/FileCard';
import { invokeCommand } from '../../lib/tauri-bridge';
import { Scaling, Cpu } from 'lucide-react';

export const DPITool: React.FC = () => {
  const { jobs, removeJob, updateJobProgress, isProcessing, setIsProcessing } = useJobStore();
  const imageJobs = jobs.filter((j) => j.fileType === 'image');

  const [targetDpi, setTargetDpi] = useState<number>(300);
  const [mode, setMode] = useState<'metadata' | 'resample'>('metadata');

  const handleApplyDpi = async () => {
    if (imageJobs.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (const job of imageJobs) {
      updateJobProgress(job.id, 50, 'processing');
      try {
        await invokeCommand('change_dpi', {
          inputPath: job.filePath,
          targetDpi,
          mode,
        });
        updateJobProgress(job.id, 100, 'completed');
      } catch (err: any) {
        updateJobProgress(job.id, 0, 'failed', err?.message || 'DPI update failed');
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-engine-text flex items-center gap-2 uppercase tracking-wider">
            <Scaling className="w-4 h-4 text-engine-cyan" />
            Dual-Mode DPI Resampling & Density Modifier
          </h2>
          <p className="text-[11px] text-engine-muted mt-0.5">
            EXIF/JFIF header modification or physical pixel grid resampling (W = Inches × DPI)
          </p>
        </div>
      </div>

      <DropZone acceptType="image" title="INGEST IMAGES FOR DPI DENSITY MODIFIER" />

      {imageJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs text-engine-muted border-b border-engine-border pb-1">
              IMAGE QUEUE ({imageJobs.length})
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {imageJobs.map((job) => (
                <FileCard key={job.id} job={job} onRemove={removeJob} />
              ))}
            </div>
          </div>

          <div className="panel-engine space-y-4 h-fit">
            <h3 className="text-xs font-bold text-engine-text uppercase tracking-wider border-b border-engine-border pb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-engine-cyan" />
              RESOLUTION METRICS
            </h3>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-engine-muted block uppercase">TARGET DENSITY (DPI)</label>
              <div className="grid grid-cols-4 gap-1">
                {[72, 150, 300, 600].map((dpi) => (
                  <button
                    key={dpi}
                    onClick={() => setTargetDpi(dpi)}
                    className={`py-1 border rounded-sm text-xs font-mono font-bold ${
                      targetDpi === dpi
                        ? 'border-engine-cyan bg-engine-cyan text-engine-bg'
                        : 'border-engine-border text-engine-muted hover:border-engine-text'
                    }`}
                  >
                    {dpi}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-engine-muted block uppercase">STRATEGY MODE</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setMode('metadata')}
                  className={`w-full p-2 text-left border rounded-sm font-mono transition-all ${
                    mode === 'metadata'
                      ? 'border-engine-cyan bg-engine-surfaceHover text-engine-cyan'
                      : 'border-engine-border text-engine-muted'
                  }`}
                >
                  <div className="text-xs font-bold">EXIF_HEADER_ONLY</div>
                  <div className="text-[9px] opacity-70">Density metadata tag update (Fast)</div>
                </button>
                <button
                  onClick={() => setMode('resample')}
                  className={`w-full p-2 text-left border rounded-sm font-mono transition-all ${
                    mode === 'resample'
                      ? 'border-engine-cyan bg-engine-surfaceHover text-engine-cyan'
                      : 'border-engine-border text-engine-muted'
                  }`}
                >
                  <div className="text-xs font-bold">TRUE_PIXEL_RESAMPLE</div>
                  <div className="text-[9px] opacity-70">Physical pixel recalculation (Print)</div>
                </button>
              </div>
            </div>

            <button onClick={handleApplyDpi} disabled={isProcessing} className="btn-engine w-full py-2.5">
              {isProcessing ? 'UPDATING...' : `APPLY ${targetDpi} DPI`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
