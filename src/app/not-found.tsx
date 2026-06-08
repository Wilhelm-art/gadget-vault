import React from "react";
import Link from "next/link";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary p-6 text-center">
      <div className="max-w-md space-y-6">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 rounded-full bg-accent-gold-light/40 flex items-center justify-center mx-auto mb-2 animate-bounce">
          <HelpCircle className="w-12 h-12 text-accent-gold" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold text-text-primary">404</h1>
          <h2 className="text-lg font-bold text-text-primary">Halaman Tidak Ditemukan</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan. Silakan kembali ke beranda atau periksa alamat URL Anda.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <Button className="bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white hover:from-accent-gold-hover hover:to-accent-gold px-6 py-5 rounded-xl text-xs font-bold gap-2 shadow-sm">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
