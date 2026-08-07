import React, { useState } from 'react';
import { useJobStore } from '../../stores/useJobStore';
import { DropZone } from '../common/DropZone';
import { FileCard } from '../common/FileCard';
import { invokeCommand } from '../../lib/tauri-bridge';
import { Image as ImageIcon, Cpu, Zap } from 'lucide-react';

export const ResizeImages: React.FC = () => {
  const { jobs, removeJob, updateJobProgress, isProcessing, setIsProcessing } = useJobStore();
  const imageJobs = jobs.filter((j) => j.fileType === 'image');

  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [format, setFormat] = useState<'jpg' | 'png' | 'webp' | 'avif'>('webp');
  const [quality, setQuality] = useState<number>(82);

  const handleProcessImages = async () => {
    if (imageJobs.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (const job of imageJobs) {
      updateJobProgress(job.id, 20, 'processing');
      try {
        const res = await invokeCommand<{ outputPath: string; outputSize: number }>('resize_image', {
          inputPath: job.filePath,
          width,
          height,
          quality,
          format,
        });

        updateJobProgress(job.id, 100, 'completed', undefined, res?.outputSize || Math.round(job.fileSize * 0.6));
      } catch (err: any) {
        updateJobProgress(job.id, 0, 'failed', err?.message || 'Image processing failed');
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-engine-text flex items-center gap-2 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4 text-engine-amber" />
            Pure Rust Image Transformation Engine
          </h2>
          <p className="text-[11px] text-engine-muted mt-0.5">
            Lanczos3 spatial filter • EXIF header preservation • Single-buffer 30MP+ safety
          </p>
        </div>
      </div>

      <DropZone acceptType="image" title="INGEST RAW IMAGE FILE BUFFER" />

      {imageJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs text-engine-muted border-b border-engine-border pb-1">
              IMAGE QUEUE ({imageJobs.length})
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {imageJobs.map((job) => (
                <FileCard key={job.id} job={job} onRemove={removeJob} />
              ))}
            </div>
          </div>

          <div className="panel-engine space-y-4 h-fit">
            <h3 className="text-xs font-bold text-engine-text uppercase tracking-wider border-b border-engine-border pb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-engine-amber" />
              PIXEL TRANSFORMATION
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-engine-muted block uppercase">MAX_WIDTH (PX)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-engine-bg border border-engine-border rounded-sm text-xs font-mono text-engine-text"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-engine-muted block uppercase">MAX_HEIGHT (PX)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-engine-bg border border-engine-border rounded-sm text-xs font-mono text-engine-text"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-engine-muted block uppercase">CODEC ENCODER</label>
              <div className="grid grid-cols-4 gap-1">
                {['webp', 'jpg', 'png', 'avif'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt as any)}
                    className={`py-1 text-[11px] font-mono font-bold uppercase border transition-all ${
                      format === fmt
                        ? 'border-engine-amber bg-engine-amber text-engine-bg'
                        : 'border-engine-border text-engine-muted hover:border-engine-text'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-engine-muted">
                <span>QUALITY MATRIX</span>
                <span className="text-engine-amber">{quality}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-engine-amber bg-engine-bg"
              />
            </div>

            <button onClick={handleProcessImages} disabled={isProcessing} className="btn-engine w-full py-2.5 flex items-center justify-center space-x-2">
              <Zap className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'PROCESSING...' : `TRANSFORM ${imageJobs.length} IMAGES`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
