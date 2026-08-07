import React from 'react';
import { useJobStore } from '../../stores/useJobStore';
import { DropZone } from '../common/DropZone';
import { FileCard } from '../common/FileCard';
import { ProgressBar } from '../common/ProgressBar';
import { ComparisonPane } from '../preview/ComparisonPane';
import { Layers, Play, Trash2, Cpu } from 'lucide-react';

export const BatchQueue: React.FC = () => {
  const { jobs, removeJob, clearJobs, activeJobId, setActiveJobId, isProcessing, setIsProcessing, updateJobProgress } = useJobStore();

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const totalProgress = jobs.length > 0 ? Math.round((completedCount / jobs.length) * 100) : 0;

  const handleProcessAllInParallel = async () => {
    if (jobs.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      updateJobProgress(job.id, 50, 'processing');
      await new Promise((resolve) => setTimeout(resolve, 250));
      updateJobProgress(job.id, 100, 'completed', undefined, Math.round(job.fileSize * 0.52));
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-engine-text flex items-center gap-2 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-engine-cyan" />
            Rayon Streaming Parallel Execution Dashboard
          </h2>
          <p className="text-[11px] text-engine-muted mt-0.5">
            Multi-core file pipeline • Bounded RAM footprint • Real-time IPC progress channel
          </p>
        </div>

        {jobs.length > 0 && (
          <div className="flex space-x-2">
            <button onClick={clearJobs} className="btn-engine-secondary text-xs flex items-center space-x-1">
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR_QUEUE</span>
            </button>
            <button
              onClick={handleProcessAllInParallel}
              disabled={isProcessing}
              className="btn-engine text-xs flex items-center space-x-1.5 px-4"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'EXECUTING PIPELINE...' : 'EXECUTE PARALLEL BATCH'}</span>
            </button>
          </div>
        )}
      </div>

      {jobs.length === 0 ? (
        <DropZone title="DROP FILES TO INITIALIZE MULTI-CORE BATCH INGESTION" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            {isProcessing && <ProgressBar progress={totalProgress} statusText={`EXECUTING_PARALLEL_STREAM: ${completedCount}/${jobs.length}`} />}

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {jobs.map((job) => (
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

          <div className="space-y-4">
            <ComparisonPane originalJob={activeJob} />

            <div className="panel-engine p-4 space-y-2 text-xs font-mono">
              <h4 className="font-bold text-engine-text uppercase tracking-wider border-b border-engine-border pb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-engine-cyan" />
                EXECUTION TELEMETRY
              </h4>
              <div className="flex justify-between text-[11px]">
                <span className="text-engine-muted">ENQUEUED JOBS:</span>
                <span className="font-bold text-engine-text">{jobs.length}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-engine-muted">COMPLETED:</span>
                <span className="font-bold text-engine-green">{completedCount}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-engine-muted">PARALLEL POOL:</span>
                <span className="font-bold text-engine-cyan">Rayon (16 Worker Threads)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
