import React from 'react';
import { useJobStore } from '../../stores/useJobStore';
import { ToolId } from '../../types/tools';

interface TabItem {
  id: ToolId;
  label: string;
  category: 'core' | 'ai';
  telemetryTag?: string;
}

const coreTabs: TabItem[] = [
  { id: 'compress-pdf', label: 'COMPRESS_PDF', category: 'core' },
  { id: 'merge-split-pdf', label: 'MERGE_SPLIT', category: 'core' },
  { id: 'resize-images', label: 'RESIZE_IMG', category: 'core' },
  { id: 'dpi-tool', label: 'DPI_RESAMPLE', category: 'core' },
  { id: 'repair-pdf', label: 'REPAIR_XREF', category: 'core' },
  { id: 'batch-queue', label: 'BATCH_QUEUE', category: 'core' },
];

const aiTabs: TabItem[] = [
  { id: 'local-ocr', label: 'LOCAL_OCR', category: 'ai', telemetryTag: 'ONNX' },
  { id: 'semantic-search', label: 'VECTOR_SEARCH', category: 'ai', telemetryTag: '384d' },
  { id: 'workflow-builder', label: 'AUTOMATIONS', category: 'ai', telemetryTag: 'DAG' },
];

export const NavigationTabs: React.FC = () => {
  const { activeTool, setActiveTool, jobs } = useJobStore();

  return (
    <div className="w-full bg-engine-surface border-b border-engine-border px-5 pt-1.5 flex items-center justify-between font-mono text-xs overflow-x-auto">
      <div className="flex items-center space-x-1">
        {/* Core File Operations Group */}
        <div className="flex items-center space-x-1">
          {coreTabs.map((tab) => {
            const isActive = activeTool === tab.id;
            const count = tab.id === 'batch-queue' ? jobs.length : 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id)}
                className={`px-3 py-2 text-[11px] font-mono tracking-wider transition-all border-b-2 ${
                  isActive
                    ? 'bg-engine-bg text-engine-cyan border-engine-cyan font-bold'
                    : 'text-engine-muted border-transparent hover:text-engine-text hover:bg-engine-bg/50'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="ml-1.5 px-1 py-0.2 bg-engine-cyan text-engine-bg text-[10px] font-bold rounded-sm">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Functional Divider */}
        <div className="h-5 w-[1px] bg-engine-border mx-2" />

        {/* AI & Automation Group */}
        <div className="flex items-center space-x-1">
          {aiTabs.map((tab) => {
            const isActive = activeTool === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id)}
                className={`px-3 py-2 text-[11px] font-mono tracking-wider transition-all border-b-2 flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-engine-bg text-engine-amber border-engine-amber font-bold'
                    : 'text-engine-muted border-transparent hover:text-engine-text hover:bg-engine-bg/50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.telemetryTag && (
                  <span className="text-[9px] px-1 bg-engine-border text-engine-muted rounded-sm uppercase">
                    {tab.telemetryTag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
