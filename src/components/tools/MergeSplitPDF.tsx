import React, { useState } from 'react';
import { useJobStore } from '../../stores/useJobStore';
import { DropZone } from '../common/DropZone';
import { FileCard } from '../common/FileCard';
import { invokeCommand } from '../../lib/tauri-bridge';
import { Split, Combine, RotateCw, Cpu, Play } from 'lucide-react';

export const MergeSplitPDF: React.FC = () => {
  const { jobs, removeJob, updateJobProgress, isProcessing, setIsProcessing } = useJobStore();
  const pdfJobs = jobs.filter((j) => j.fileType === 'pdf');

  const [mode, setMode] = useState<'merge' | 'split' | 'rotate'>('merge');
  const [pageRanges, setPageRanges] = useState<string>('1-3, 5, 8-end');
  const [rotationDegrees, setRotationDegrees] = useState<90 | 180 | 270>(90);

  const handleExecute = async () => {
    if (pdfJobs.length === 0 || isProcessing) return;
    setIsProcessing(true);

    try {
      if (mode === 'merge') {
        const inputPaths = pdfJobs.map((j) => j.filePath);
        await invokeCommand('merge_pdfs', { inputPaths });
        pdfJobs.forEach((j) => updateJobProgress(j.id, 100, 'completed'));
      } else if (mode === 'split') {
        for (const job of pdfJobs) {
          updateJobProgress(job.id, 50, 'processing');
          await invokeCommand('split_pdf', { inputPath: job.filePath, pageRanges });
          updateJobProgress(job.id, 100, 'completed');
        }
      } else if (mode === 'rotate') {
        for (const job of pdfJobs) {
          updateJobProgress(job.id, 50, 'processing');
          await invokeCommand('rotate_pdf', { inputPath: job.filePath, degrees: rotationDegrees });
          updateJobProgress(job.id, 100, 'completed');
        }
      }
    } catch (err: any) {
      pdfJobs.forEach((j) => updateJobProgress(j.id, 0, 'failed', err?.message || 'Operation failed'));
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-engine-text flex items-center gap-2 uppercase tracking-wider">
            <Split className="w-4 h-4 text-engine-cyan" />
            qpdf PDF Structure & Page Extraction Engine
          </h2>
          <p className="text-[11px] text-engine-muted mt-0.5">
            Lossless object stream concatenation • Range extraction • Page rotation matrix
          </p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-engine-border pb-2">
        {[
          { id: 'merge', label: 'MERGE_STREAMS', icon: <Combine className="w-3.5 h-3.5" /> },
          { id: 'split', label: 'EXTRACT_PAGES', icon: <Split className="w-3.5 h-3.5" /> },
          { id: 'rotate', label: 'ROTATE_MATRIX', icon: <RotateCw className="w-3.5 h-3.5" /> },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`btn-engine-secondary text-xs flex items-center space-x-2 ${
              mode === m.id ? 'bg-engine-cyan text-engine-bg border-engine-cyan font-bold' : ''
            }`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <DropZone acceptType="pdf" title="INGEST PDF FILES FOR STRUCTURE OPERATOR" />

      {pdfJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs text-engine-muted border-b border-engine-border pb-1">
              FILE QUEUE ({pdfJobs.length})
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {pdfJobs.map((job) => (
                <FileCard key={job.id} job={job} onRemove={removeJob} />
              ))}
            </div>
          </div>

          <div className="panel-engine space-y-4 h-fit">
            <h3 className="text-xs font-bold text-engine-text uppercase tracking-wider border-b border-engine-border pb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-engine-cyan" />
              OPERATOR PARAMETERS
            </h3>

            {mode === 'split' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-engine-muted block uppercase">Page Range Specifier</label>
                <input
                  type="text"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                  placeholder="e.g. 1-5, 8, 10-end"
                  className="w-full px-2.5 py-1.5 bg-engine-bg border border-engine-border rounded-sm text-xs font-mono text-engine-cyan focus:outline-none focus:border-engine-cyan"
                />
                <p className="text-[10px] text-engine-subtle">Page indices: 1-based (e.g. 1-5, 8-end)</p>
              </div>
            )}

            {mode === 'rotate' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-engine-muted block uppercase">Clockwise Angle Matrix</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setRotationDegrees(deg as any)}
                      className={`py-1.5 border rounded-sm text-xs font-mono ${
                        rotationDegrees === deg
                          ? 'border-engine-cyan bg-engine-cyan text-engine-bg font-bold'
                          : 'border-engine-border text-engine-muted hover:border-engine-text'
                      }`}
                    >
                      +{deg}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleExecute} disabled={isProcessing} className="btn-engine w-full py-2.5 flex items-center justify-center space-x-2">
              <Play className="w-3.5 h-3.5" />
              <span>
                {isProcessing
                  ? 'EXECUTING...'
                  : mode === 'merge'
                  ? `MERGE ${pdfJobs.length} FILES`
                  : mode === 'split'
                  ? 'EXTRACT PAGES'
                  : 'APPLY ROTATION'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
