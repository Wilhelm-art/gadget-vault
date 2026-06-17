"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLayout } from "@/components/admin/admin-layout-context";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Users,
  UserCheck,
  CircleDollarSign,
  CalendarClock,
  ShoppingCart,
  Tag,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  pendingKyc?: number;
  pendingDeposit?: number;
  pendingRentals?: number;
}

export default function AdminSidebar({
  pendingKyc = 0,
  pendingDeposit = 0,
  pendingRentals = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(["Dashboard", "Katalog", "Pelanggan", "Keuangan", "Sistem"]);
  const { isSidebarOpen, closeSidebar } = useAdminLayout();

  const navGroups: NavGroup[] = [
    {
      label: "Dashboard",
      items: [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      label: "Katalog",
      items: [
        { name: "Semua Produk", href: "/admin/produk", icon: Package },
        { name: "Tambah Produk", href: "/admin/produk/tambah", icon: PlusCircle },
      ],
    },
    {
      label: "Pelanggan",
      items: [
        { name: "Daftar Pelanggan", href: "/admin/pelanggan", icon: Users },
        { name: "Antrian KYC", href: "/admin/kyc", icon: UserCheck, badge: pendingKyc },
      ],
    },
    {
      label: "Keuangan",
      items: [
        { name: "Deposit Jaminan", href: "/admin/deposit", icon: CircleDollarSign, badge: pendingDeposit },
        { name: "Transaksi Sewa", href: "/admin/transaksi/sewa", icon: CalendarClock, badge: pendingRentals },
        { name: "Transaksi Beli", href: "/admin/transaksi/beli", icon: ShoppingCart },
        { name: "Penawaran Jual", href: "/admin/transaksi/jual", icon: Tag },
      ],
    },
    {
      label: "Sistem",
      items: [
        { name: "Pengaturan Toko", href: "/admin/pengaturan", icon: Settings },
      ],
    },
  ];

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isItemActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => isItemActive(item.href));

  const totalBadge = (group: NavGroup) =>
    group.items.reduce((sum, item) => sum + (item.badge || 0), 0);

  return (
    <>
      {/* Backdrop Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden cursor-pointer"
          onClick={closeSidebar}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-700/60 flex flex-col transform transition-transform duration-300 ease-in-out md:static md:w-60 md:translate-x-0 md:min-h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navGroups.map((group) => {
          const isOpen = openGroups.includes(group.label);
          const groupActive = isGroupActive(group);
          const groupBadge = totalBadge(group);

          return (
            <div key={group.label} className="mb-1">
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors ${
                  groupActive
                    ? "text-amber-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span>{group.label}</span>
                <div className="flex items-center gap-1.5">
                  {groupBadge > 0 && (
                    <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                      {groupBadge}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </div>
              </button>

              {/* Group Items */}
              {isOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                    const active = isItemActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          active
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              active ? "text-amber-400" : "text-slate-500"
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: View Store link */}
      <div className="px-3 py-4 border-t border-slate-700/60">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Lihat Toko (customer view)</span>
        </Link>
      </div>
      </aside>
    </>
  );
}
