import React from 'react';
import { useJobStore } from '../../stores/useJobStore';
import { DropZone } from '../common/DropZone';
import { FileCard } from '../common/FileCard';
import { invokeCommand } from '../../lib/tauri-bridge';
import { Wrench, ShieldCheck, Zap } from 'lucide-react';

export const RepairPDF: React.FC = () => {
  const { jobs, removeJob, updateJobProgress, isProcessing, setIsProcessing } = useJobStore();
  const pdfJobs = jobs.filter((j) => j.fileType === 'pdf');

  const handleRepairAll = async () => {
    if (pdfJobs.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (const job of pdfJobs) {
      updateJobProgress(job.id, 30, 'processing');
      try {
        await invokeCommand('repair_pdf', { inputPath: job.filePath });
        updateJobProgress(job.id, 100, 'completed');
      } catch (err: any) {
        updateJobProgress(job.id, 0, 'failed', err?.message || 'PDF repair failed');
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-engine-text flex items-center gap-2 uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-engine-cyan" />
            qpdf XRef Trailer Reconstruction & Linearizer
          </h2>
          <p className="text-[11px] text-engine-muted mt-0.5">
            Rebuilds corrupt cross-reference offset tables • Web linearization optimization
          </p>
        </div>
      </div>

      <DropZone acceptType="pdf" title="INGEST DAMAGED OR CORRUPT PDF STREAM" />

      {pdfJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs text-engine-muted border-b border-engine-border pb-1">
              DAMAGED QUEUE ({pdfJobs.length})
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {pdfJobs.map((job) => (
                <FileCard key={job.id} job={job} onRemove={removeJob} />
              ))}
            </div>
          </div>

          <div className="panel-engine space-y-4 h-fit">
            <h3 className="text-xs font-bold text-engine-text uppercase tracking-wider border-b border-engine-border pb-2">
              REPAIR DIAGNOSTICS
            </h3>

            <div className="space-y-2 text-xs text-engine-muted">
              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-engine-green flex-shrink-0 mt-0.5" />
                <span>Reconstructs broken byte offsets in trailer XRef tables</span>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="w-3.5 h-3.5 text-engine-amber flex-shrink-0 mt-0.5" />
                <span>Optimizes stream layout for Fast Web View (Linearization)</span>
              </div>
            </div>

            <button onClick={handleRepairAll} disabled={isProcessing} className="btn-engine w-full py-2.5">
              {isProcessing ? 'REBUILDING OBJECTS...' : `REPAIR ${pdfJobs.length} FILES`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
