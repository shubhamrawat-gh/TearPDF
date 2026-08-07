import React from 'react';
import { Workflow, FolderSync, Zap, Play, CheckCircle } from 'lucide-react';

export const WorkflowBuilder: React.FC = () => {
  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-engine-text flex items-center gap-2 uppercase tracking-wider">
            <Workflow className="w-4 h-4 text-engine-amber" />
            V2 Event-Driven Workflow Automation & DAG Executor
            <span className="text-[10px] px-1.5 py-0.2 bg-engine-amber/10 text-engine-amber border border-engine-amber/30 rounded-sm">
              V2_EXT_SPEC
            </span>
          </h2>
          <p className="text-[11px] text-engine-muted mt-0.5">
            Folder watcher triggers (`notify` crate) • Multi-step rule pipelines • Automated file action chains
          </p>
        </div>
      </div>

      <div className="panel-engine space-y-4">
        <h3 className="text-xs font-bold text-engine-text uppercase tracking-wider">
          SAMPLE PIPELINE DAG: SCANNED PDF INTAKE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {[
            { step: '1', title: 'DIRECTORY_WATCHER', desc: 'Monitors C:/Downloads/*.pdf', icon: <FolderSync className="w-3.5 h-3.5 text-engine-cyan" /> },
            { step: '2', title: 'ONNX_OCR_FILTER', desc: 'Executes local text layer creation', icon: <Zap className="w-3.5 h-3.5 text-engine-amber" /> },
            { step: '3', title: 'GS_STREAM_COMPRESS', desc: 'Applies Ebook 150 DPI preset', icon: <Play className="w-3.5 h-3.5 text-engine-green" /> },
            { step: '4', title: 'AUTO_ARCHIVE_MOVE', desc: 'Renames & moves to C:/Archive/', icon: <CheckCircle className="w-3.5 h-3.5 text-purple-400" /> },
          ].map((item) => (
            <div key={item.step} className="p-3 bg-engine-bg border border-engine-border rounded-sm space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-engine-muted">NODE_#{item.step}</span>
                {item.icon}
              </div>
              <div className="font-bold text-xs text-engine-text">{item.title}</div>
              <div className="text-[10px] text-engine-subtle">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="p-3.5 bg-engine-bg border border-engine-amber/40 rounded-sm text-xs text-engine-amber space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-engine-amber" />
            STATELESS TOOLADAPTER ARCHITECTURE READY
          </div>
          <p className="text-[11px] text-engine-muted">
            V1 tools implement the stateless Rust <code className="font-mono bg-engine-surface px-1 py-0.5 text-engine-amber border border-engine-border">ToolAdapter</code> trait, enabling V2 DAG nodes to invoke core operations directly.
          </p>
        </div>
      </div>
    </div>
  );
};
