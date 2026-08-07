import React, { useState } from 'react';
import { useJobStore } from '../../stores/useJobStore';
import { DropZone } from '../common/DropZone';
import { FileCard } from '../common/FileCard';
import { ComparisonPane } from '../preview/ComparisonPane';
import { invokeCommand } from '../../lib/tauri-bridge';
import { FileArchive, Cpu, Zap } from 'lucide-react';

export const CompressPDF: React.FC = () => {
  const { jobs, removeJob, clearJobs, updateJobProgress, isProcessing, setIsProcessing, activeJobId, setActiveJobId } = useJobStore();
  const pdfJobs = jobs.filter((j) => j.fileType === 'pdf');
  const activeJob = pdfJobs.find((j) => j.id === activeJobId) || pdfJobs[0];

  const [preset, setPreset] = useState<'screen' | 'ebook' | 'printer' | 'grayscale'>('ebook');
  const [jpegQuality, setJpegQuality] = useState<number>(75);

  const handleStartCompression = async () => {
    if (pdfJobs.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (let i = 0; i < pdfJobs.length; i++) {
      const job = pdfJobs[i];
      updateJobProgress(job.id, 10, 'processing');

      try {
        const result = await invokeCommand<{ outputPath: string; outputSize: number }>('compress_pdf', {
          inputPath: job.filePath,
          preset,
          jpegQuality,
        });

        updateJobProgress(job.id, 100, 'completed', undefined, result?.outputSize || Math.round(job.fileSize * 0.45));
      } catch (err: any) {
        updateJobProgress(job.id, 0, 'failed', err?.message || 'Compression failed');
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-engine-text flex items-center gap-2 uppercase tracking-wider">
            <FileArchive className="w-4 h-4 text-engine-cyan" />
            Ghostscript PDF Stream Compression Engine
          </h2>
          <p className="text-[11px] text-engine-muted mt-0.5">
            Vector stream recompression • Downsampling • Color space conversion (-dPDFSETTINGS)
          </p>
        </div>
        {pdfJobs.length > 0 && (
          <button onClick={clearJobs} className="btn-engine-secondary text-[11px]">
            CLEAR_QUEUE
          </button>
        )}
      </div>

      {/* Compression-in-progress / Ingestion Panel */}
      {pdfJobs.length === 0 ? (
        <DropZone acceptType="pdf" title="INGEST PDF STREAM FOR COMPRESSION" subtitle="Ghostscript sidecar re-encodes PDF streams file-by-file with zero memory buffering" />
      ) : (
        <div className="space-y-4">
          <ComparisonPane originalJob={activeJob} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-3">
              <div className="flex justify-between items-center text-xs text-engine-muted border-b border-engine-border pb-1">
                <span>INGESTED QUEUE ({pdfJobs.length})</span>
                <span className="text-engine-cyan font-bold">STREAM_ACTIVE</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {pdfJobs.map((job) => (
                  <FileCard
                    key={job.id}
                    job={job}
                    onRemove={removeJob}
                    onSelect={setActiveJobId}
                    isSelected={activeJob?.id === job.id}
                  />
                ))}
              </div>
            </div>

            <div className="panel-engine space-y-4 h-fit">
              <h3 className="text-xs font-bold text-engine-text uppercase tracking-wider border-b border-engine-border pb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-engine-cyan" />
                ENGINE CONFIGURATION
              </h3>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-engine-muted block uppercase">Downsample Preset</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'screen', label: '72 DPI', desc: 'SCREEN (/screen)' },
                    { id: 'ebook', label: '150 DPI', desc: 'EBOOK (/ebook)' },
                    { id: 'printer', label: '300 DPI', desc: 'PRINT (/printer)' },
                    { id: 'grayscale', label: 'B&W', desc: 'GRAYSCALE' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPreset(p.id as any)}
                      className={`p-2 text-left border rounded-sm font-mono transition-all ${
                        preset === p.id
                          ? 'border-engine-cyan bg-engine-surfaceHover text-engine-cyan font-bold'
                          : 'border-engine-border text-engine-muted hover:border-engine-text'
                      }`}
                    >
                      <div className="text-xs">{p.label}</div>
                      <div className="text-[9px] opacity-70">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-engine-muted">
                  <span>JPEG QUALITY FACTOR</span>
                  <span className="text-engine-cyan">{jpegQuality}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={jpegQuality}
                  onChange={(e) => setJpegQuality(Number(e.target.value))}
                  className="w-full accent-engine-cyan bg-engine-bg"
                />
              </div>

              <button
                onClick={handleStartCompression}
                disabled={isProcessing}
                className="btn-engine w-full flex items-center justify-center space-x-2 py-2.5"
              >
                <Zap className="w-4 h-4" />
                <span>{isProcessing ? 'COMPRESSING...' : 'RUN STREAM COMPRESSOR'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
