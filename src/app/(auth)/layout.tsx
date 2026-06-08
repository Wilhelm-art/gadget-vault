import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="flex flex-col items-center">
          <Link href="/">
            <span className="font-display text-4xl font-bold tracking-tight text-accent-gold cursor-pointer hover:text-accent-gold-hover transition-colors">
              GadgetVault
            </span>
          </Link>
          <p className="mt-2 text-sm text-text-secondary">
            Platform Jual, Beli & Sewa Gadget Premium
          </p>
        </div>
        <div className="bg-white px-8 py-10 rounded-2xl border border-border shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
