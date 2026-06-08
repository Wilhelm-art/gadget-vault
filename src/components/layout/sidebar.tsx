"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FileSpreadsheet,
  Users,
  UserCheck,
  CircleDollarSign,
  Settings,
  User,
  Heart,
  Bell,
  History,
} from "lucide-react";

interface SidebarProps {
  type: "admin" | "user";
}

export default function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const adminLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Manajemen Produk", href: "/admin/produk", icon: Package },
    { name: "Daftar Pelanggan", href: "/admin/pelanggan", icon: Users },
    { name: "Antrian KYC", href: "/admin/kyc", icon: UserCheck },
    { name: "Manajemen Deposit", href: "/admin/deposit", icon: CircleDollarSign },
    { name: "Pengaturan Toko", href: "/admin/pengaturan", icon: Settings },
  ];

  const userLinks = [
    { name: "Profil Saya", href: "/profil", icon: User },
    { name: "Verifikasi KYC", href: "/kyc", icon: UserCheck },
    { name: "Riwayat Transaksi", href: "/transaksi", icon: History },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Notifikasi", href: "/notifikasi", icon: Bell },
  ];

  const links = type === "admin" ? adminLinks : userLinks;

  return (
    <aside className="w-full md:w-64 bg-white border border-border rounded-2xl p-4 shrink-0 shadow-sm self-start">
      {/* Header Profile / Admin Title */}
      <div className="px-2 py-4 mb-4 border-b border-border/60">
        {type === "admin" ? (
          <div>
            <h3 className="font-display font-semibold text-text-primary text-lg">Admin Console</h3>
            <p className="text-xs text-text-secondary mt-0.5">Kelola operasional toko</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-gold-light text-accent-gold flex items-center justify-center font-bold text-sm uppercase">
              {session?.user?.name ? session.user.name.charAt(0) : "U"}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text-primary text-sm truncate">{session?.user?.name || "User"}</h3>
              <p className="text-xs text-text-secondary truncate mt-0.5">{session?.user?.email || ""}</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href + "/"));
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent-gold-light text-accent-gold-hover border-l-4 border-accent-gold shadow-sm"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-accent-gold-hover" : "text-text-secondary"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
