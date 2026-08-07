import React from 'react';
import { Header } from './components/common/Header';
import { NavigationTabs } from './components/common/NavigationTabs';
import { useJobStore } from './stores/useJobStore';

import { CompressPDF } from './components/tools/CompressPDF';
import { MergeSplitPDF } from './components/tools/MergeSplitPDF';
import { ResizeImages } from './components/tools/ResizeImages';
import { DPITool } from './components/tools/DPITool';
import { RepairPDF } from './components/tools/RepairPDF';
import { BatchQueue } from './components/batch/BatchQueue';
import { WorkflowBuilder } from './components/automation/WorkflowBuilder';
import { LocalOCR } from './components/ai/LocalOCR';
import { SemanticSearch } from './components/ai/SemanticSearch';

export const App: React.FC = () => {
  const { activeTool } = useJobStore();

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'compress-pdf':
        return <CompressPDF />;
      case 'merge-split-pdf':
        return <MergeSplitPDF />;
      case 'resize-images':
        return <ResizeImages />;
      case 'dpi-tool':
        return <DPITool />;
      case 'repair-pdf':
        return <RepairPDF />;
      case 'batch-queue':
        return <BatchQueue />;
      case 'workflow-builder':
        return <WorkflowBuilder />;
      case 'local-ocr':
        return <LocalOCR />;
      case 'semantic-search':
        return <SemanticSearch />;
      default:
        return <CompressPDF />;
    }
  };

  return (
    <div className="min-h-screen bg-engine-bg text-engine-text flex flex-col font-sans selection:bg-engine-cyan selection:text-engine-bg">
      <Header />
      <NavigationTabs />

      <main className="flex-1 max-w-7xl w-full mx-auto p-5 md:p-6">
        {renderActiveTool()}
      </main>

      <footer className="w-full border-t border-engine-border py-2.5 px-5 font-mono text-[10px] text-engine-subtle bg-engine-surface flex items-center justify-between">
        <div>TEARPDF ENGINE v1.0.0 • LOCAL SANDBOX</div>
        <div>HOST: TAURI 2.x • RUST CORE • REACT 18</div>
      </footer>
    </div>
  );
};

export default App;
