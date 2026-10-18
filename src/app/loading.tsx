import React from "react";

export default function Loading() {
  return (
    <div
      aria-label="Memuat halaman..."
      className="fixed inset-0 z-[100] bg-[#FCFAF6]/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 transition-opacity duration-300 pointer-events-none"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Editorial pulsing monogram */}
        <div className="relative w-12 h-12 rounded-full bg-[#161514] text-[#FCFAF6] flex items-center justify-center shadow-lg animate-pulse">
          <span className="font-serif text-sm tracking-widest uppercase font-medium">
            M<span className="text-[#B8976C]">.</span>P
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#846F54] font-semibold animate-pulse">
            MOMEN.POTRAIT
          </span>
          <span className="text-[11px] text-[#9A8973] font-light">
            Memuat konten studio...
          </span>
        </div>
      </div>
    </div>
  );
}
