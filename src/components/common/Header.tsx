import React from 'react';
import { Cpu, HardDrive, ShieldCheck, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-engine-surface border-b border-engine-border px-5 py-2.5 flex items-center justify-between font-mono">
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 bg-engine-cyan text-engine-bg flex items-center justify-center font-bold text-xs rounded-sm">
          TP
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-engine-text tracking-wide uppercase">TEARPDF</span>
            <span className="text-[10px] text-engine-cyan border border-engine-cyan/30 px-1.5 py-0.2 rounded-sm bg-engine-cyan/5">
              v1.0.0-LOCAL
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-[11px] text-engine-muted">
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-engine-cyan" />
          <span>THREADS:</span>
          <span className="text-engine-text font-bold">16 CORES</span>
        </div>

        <div className="flex items-center space-x-2">
          <HardDrive className="w-3.5 h-3.5 text-engine-amber" />
          <span>RAM ALLOC:</span>
          <span className="text-engine-text font-bold">48.2 MB</span>
        </div>

        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-engine-green" />
          <span>THROUGHPUT:</span>
          <span className="text-engine-text font-bold">0.00 MB/s</span>
        </div>

        <div className="flex items-center space-x-1.5 border-l border-engine-border pl-4 text-engine-text">
          <ShieldCheck className="w-3.5 h-3.5 text-engine-cyan" />
          <span className="text-[10px] uppercase font-bold text-engine-cyan tracking-wider">OFFLINE ENGINE</span>
        </div>
      </div>
    </header>
  );
};
