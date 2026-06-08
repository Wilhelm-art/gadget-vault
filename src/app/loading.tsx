import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center space-y-4">
        {/* Modern luxury minimalist spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-accent-gold-light" />
          <div className="absolute inset-0 rounded-full border-4 border-t-accent-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest animate-pulse">
          Memuat halaman...
        </span>
      </div>
    </div>
  );
}
