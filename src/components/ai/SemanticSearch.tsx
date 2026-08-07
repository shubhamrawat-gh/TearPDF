import React from 'react';
import { Search, Database, FileText, Cpu } from 'lucide-react';

export const SemanticSearch: React.FC = () => {
  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-engine-text flex items-center gap-2 uppercase tracking-wider">
            <Search className="w-4 h-4 text-engine-cyan" />
            V2/V3 Local Vector Indexing & Natural Language Search
            <span className="text-[10px] px-1.5 py-0.2 bg-engine-cyan/10 text-engine-cyan border border-engine-cyan/30 rounded-sm">
              384d_EMBEDDINGS
            </span>
          </h2>
          <p className="text-[11px] text-engine-muted mt-0.5">
            Instant semantic document querying across local library via embedded SQLite vector storage
          </p>
        </div>
      </div>

      <div className="panel-engine space-y-4">
        <div className="flex items-center space-x-2 bg-engine-bg border border-engine-border rounded-sm p-1.5 font-mono text-xs">
          <Search className="w-4 h-4 text-engine-muted ml-2" />
          <input
            type="text"
            placeholder="QUERY: Find tax receipts from 2025 with software purchases..."
            className="w-full bg-transparent outline-none text-engine-cyan placeholder:text-engine-subtle font-mono text-xs"
            readOnly
          />
          <button className="btn-engine text-xs px-3 py-1">EXECUTE_SEARCH</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-engine-bg border border-engine-border rounded-sm space-y-1">
            <Database className="w-4 h-4 text-engine-cyan" />
            <div className="font-bold">SQLITE VECTOR EXTENSION</div>
            <div className="text-[10px] text-engine-muted">384-dimensional dense vectors stored locally in app data</div>
          </div>
          <div className="p-3 bg-engine-bg border border-engine-border rounded-sm space-y-1">
            <Cpu className="w-4 h-4 text-engine-amber" />
            <div className="font-bold">all-MiniLM-L6-v2 ENCODER</div>
            <div className="text-[10px] text-engine-muted">~80MB model footprint runs on CPU with &lt; 50ms latency</div>
          </div>
          <div className="p-3 bg-engine-bg border border-engine-border rounded-sm space-y-1">
            <FileText className="w-4 h-4 text-engine-green" />
            <div className="font-bold">BOUNDING BOX CITATIONS</div>
            <div className="text-[10px] text-engine-muted">Exact visual page offset citations for search hits</div>
          </div>
        </div>
      </div>
    </div>
  );
};
