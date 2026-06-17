"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Shield, Bell, Menu, X } from "lucide-react";
import { useAdminLayout } from "@/components/admin/admin-layout-context";

export default function AdminNavbar() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string | null; email?: string | null } | undefined;
  const { isSidebarOpen, toggleSidebar } = useAdminLayout();

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-700/60 shadow-md">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Menu Toggle + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Toggle (Mobile Only) */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors md:hidden focus:outline-none"
              aria-label={isSidebarOpen ? "Tutup menu" : "Buka menu"}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-base font-bold text-white tracking-tight">
                  GadgetVault
                </span>
                <span className="text-[10px] text-amber-400/80 font-medium tracking-widest uppercase">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Admin Profile + Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications placeholder */}
            <button
              type="button"
              className="relative p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-700" />

            {/* Admin user info */}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-end leading-none">
                <span className="text-xs font-semibold text-white">
                  {user?.name || "Admin"}
                </span>
                <span className="text-[10px] text-amber-400/80 mt-0.5">
                  Administrator
                </span>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase">
                {user?.name?.charAt(0) || "A"}
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
