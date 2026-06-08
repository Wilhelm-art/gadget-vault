"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-2 text-danger">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-text-primary">Terjadi Kesalahan Sistem</h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            Maaf, terjadi masalah pada sistem kami saat memuat halaman ini. Kami telah mencatat kesalahan ini dan akan segera memperbaikinya.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={() => reset()}
            className="bg-accent-gold text-white hover:bg-accent-gold-hover px-6 py-5 rounded-xl text-xs font-bold gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Ulangi Memuat Halaman
          </Button>
        </div>
      </div>
    </div>
  );
}
