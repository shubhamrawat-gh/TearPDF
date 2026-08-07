import React, { useState } from 'react';
import { invokeCommand } from '../../lib/tauri-bridge';
import { FileText, HardDrive } from 'lucide-react';

interface PdfThumbnailGridProps {
  pdfPath?: string;
  totalPages?: number;
}

export const PdfThumbnailGrid: React.FC<PdfThumbnailGridProps> = ({
  pdfPath,
  totalPages = 5,
}) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  const loadThumbnail = async (page: number) => {
    if (!pdfPath || thumbnails[page]) return;
    try {
      const res = await invokeCommand<{ thumbnailUrl: string }>('get_pdf_thumbnail', {
        pdfPath,
        pageNumber: page,
        targetWidth: 300,
      });
      if (res?.thumbnailUrl) {
        setThumbnails((prev) => ({ ...prev, [page]: res.thumbnailUrl }));
      }
    } catch (err) {
      console.error(`Failed to load page ${page} thumbnail`, err);
    }
  };

  return (
    <div className="panel-engine space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-engine-border pb-3">
        <h3 className="font-bold text-xs text-engine-text uppercase tracking-wider flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-engine-cyan" />
          VIRTUALIZED PAGE RASTERIZER ({totalPages} PAGES)
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-engine-bg text-engine-muted border border-engine-border rounded-sm">
          LRU_CACHE: &lt;50MB RAM
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => {
              setActivePage(pageNum);
              loadThumbnail(pageNum);
            }}
            className={`p-2 border rounded-sm text-center transition-all space-y-2 font-mono ${
              activePage === pageNum
                ? 'border-engine-cyan bg-engine-surfaceHover'
                : 'border-engine-border hover:border-engine-text bg-engine-bg'
            }`}
          >
            <div className="w-full aspect-[1/1.3] bg-engine-bg border border-engine-border rounded-sm flex flex-col items-center justify-center text-engine-muted overflow-hidden relative">
              {thumbnails[pageNum] ? (
                <img src={thumbnails[pageNum]} alt={`Page ${pageNum}`} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-5 h-5 text-engine-subtle" />
              )}
            </div>
            <div className="text-[10px] font-bold text-engine-text">PAGE_{pageNum}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
