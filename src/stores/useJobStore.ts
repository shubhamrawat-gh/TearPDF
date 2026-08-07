import { create } from 'zustand';
import { JobItem } from '../types/ipc';
import { ToolId } from '../types/tools';

interface JobState {
  activeTool: ToolId;
  jobs: JobItem[];
  isProcessing: boolean;
  activeJobId: string | null;
  setActiveTool: (tool: ToolId) => void;
  addJobs: (files: { path: string; name: string; size: number; type: 'pdf' | 'image' }[]) => void;
  removeJob: (id: string) => void;
  clearJobs: () => void;
  updateJobProgress: (id: string, progress: number, status?: JobItem['status'], error?: string, outputSize?: number) => void;
  setIsProcessing: (processing: boolean) => void;
  setActiveJobId: (id: string | null) => void;
}

export const useJobStore = create<JobState>((set) => ({
  activeTool: 'compress-pdf',
  jobs: [],
  isProcessing: false,
  activeJobId: null,

  setActiveTool: (tool) => set({ activeTool: tool }),

  addJobs: (files) =>
    set((state) => {
      const newJobs: JobItem[] = files.map((file) => ({
        id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        filePath: file.path,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: 'pending',
        progress: 0,
      }));
      return { jobs: [...state.jobs, ...newJobs] };
    }),

  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
      activeJobId: state.activeJobId === id ? null : state.activeJobId,
    })),

  clearJobs: () => set({ jobs: [], activeJobId: null, isProcessing: false }),

  updateJobProgress: (id, progress, status, error, outputSize) =>
    set((state) => ({
      jobs: state.jobs.map((job) => {
        if (job.id !== id) return job;
        return {
          ...job,
          progress,
          ...(status ? { status } : {}),
          ...(error ? { error } : {}),
          ...(outputSize !== undefined ? { outputSize } : {}),
        };
      }),
    })),

  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setActiveJobId: (id) => set({ activeJobId: id }),
}));
