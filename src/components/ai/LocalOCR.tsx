import React from 'react';
import { ScanText, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export const LocalOCR: React.FC = () => {
  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-engine-text flex items-center gap-2 uppercase tracking-wider">
            <ScanText className="w-4 h-4 text-engine-amber" />
            V2 Local OCR & Searchable PDF Layer Extraction
            <span className="text-[10px] px-1.5 py-0.2 bg-engine-amber/10 text-engine-amber border border-engine-amber/30 rounded-sm">
              ONNX_ENGINE
            </span>
          </h2>
          <p className="text-[11px] text-engine-muted mt-0.5">
            ONNX Runtime (`ort` crate) embedded RapidOCR model for zero-latency local text layer creation
          </p>
        </div>
      </div>

      <div className="panel-engine space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-engine-bg border border-engine-border rounded-sm space-y-2">
            <ShieldCheck className="w-4 h-4 text-engine-green" />
            <h3 className="font-bold text-xs">100% OFFLINE PRIVACY</h3>
            <p className="text-[11px] text-engine-muted">Sensitive financial, tax, and legal document byte streams never leave local memory.</p>
          </div>

          <div className="p-3.5 bg-engine-bg border border-engine-border rounded-sm space-y-2">
            <Cpu className="w-4 h-4 text-engine-cyan" />
            <h3 className="font-bold text-xs">AVX-512 HARDWARE ACCEL</h3>
            <p className="text-[11px] text-engine-muted">Utilizes local CPU SIMD vector instructions or DirectML GPU acceleration.</p>
          </div>

          <div className="p-3.5 bg-engine-bg border border-engine-border rounded-sm space-y-2">
            <HardDrive className="w-4 h-4 text-engine-amber" />
            <h3 className="font-bold text-xs">PDF/A INVISIBLE TEXT LAYER</h3>
            <p className="text-[11px] text-engine-muted">Injects text bounding box streams over scanned image pages for native text highlight & search.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
