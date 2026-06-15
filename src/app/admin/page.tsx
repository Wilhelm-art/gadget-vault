import React, { Suspense } from "react";
import Link from "next/link";
import { 
  Users, UserCheck, Calendar, CircleDollarSign, Clock, 
  ArrowRight, ShieldAlert, CheckCircle, Package,
  ChevronRight, TrendingUp, AlertTriangle
} from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RevenueChart from "@/components/admin/revenue-chart";

export const metadata = {
  title: "Admin Overview — GadgetVault",
  description: "Dashboard panel admin GadgetVault - Cimahi",
};

import { connection } from "next/server";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      searchParams: { search: "" },
      cookies: [],
      headers: [
        ["x-forwarded-proto", "https"],
        ["x-forwarded-host", "localhost:3000"],
        ["x-instant-validation", "true"],
      ],
    },
  ],
};

export default async function AdminDashboardOverview() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardOverviewContent />
    </Suspense>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 w-1/3">
          <div className="h-3 bg-slate-200 rounded w-1/2" />
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white h-32 flex justify-between">
            <div className="space-y-3 w-2/3">
              <div className="h-3 bg-slate-200 rounded w-2/3" />
              <div className="h-6 bg-slate-200 rounded" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-80 bg-white border border-slate-200 rounded-2xl p-5" />
        <div className="h-80 bg-white border border-slate-200 rounded-2xl p-5" />
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-64" />
    </div>
  );
}

async function AdminDashboardOverviewContent() {
  await connection();
  // Auth handled by layout, just get session for greeting
  const session = await auth();
  const adminName = (session?.user?.name || "Admin").split(" ")[0];

  // 2. Fetch overview counts
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    activeRentalsCount,
    pendingKycCount,
    pendingRentalsCount,
    pendingDepositsCount,
    completedPurchasesSum,
    completedRentalsSum,
  ] = await Promise.all([
    prisma.rentalTransaction.count({
      where: { status: "picked_up" },
    }),
    prisma.user.count({
      where: { kycStatus: "pending" },
    }),
    prisma.rentalTransaction.count({
      where: { status: "pending" },
    }),
    prisma.deposit.count({
      where: { status: "pending" },
    }),
    prisma.purchaseTransaction.aggregate({
      _sum: { amount: true },
      where: {
        status: "completed",
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.rentalTransaction.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { in: ["completed", "picked_up", "returned"] },
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  const salesRevenue = Number(completedPurchasesSum._sum?.amount || 0);
  const rentalRevenue = Number(completedRentalsSum._sum?.totalAmount || 0);
  const totalRevenueThisMonth = salesRevenue + rentalRevenue;

  // 3. Fetch recent transactions for revenue trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentPurchases, recentRentals] = await Promise.all([
    prisma.purchaseTransaction.findMany({
      where: {
        status: "completed",
        createdAt: { gte: sevenDaysAgo },
      },
      select: { amount: true, createdAt: true },
    }),
    prisma.rentalTransaction.findMany({
      where: {
        status: { in: ["completed", "picked_up", "returned"] },
        createdAt: { gte: sevenDaysAgo },
      },
      select: { totalAmount: true, createdAt: true },
    }),
  ]);

  // Aggregate daily revenue
  const dailyDataMap = new Map<string, { revenue: number; rentals: number; sales: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    dailyDataMap.set(dateStr, { revenue: 0, rentals: 0, sales: 0 });
  }

  recentPurchases.forEach((p) => {
    const dateStr = new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    if (dailyDataMap.has(dateStr)) {
      const current = dailyDataMap.get(dateStr)!;
      current.sales += Number(p.amount);
      current.revenue += Number(p.amount);
    }
  });

  recentRentals.forEach((r) => {
    const dateStr = new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    if (dailyDataMap.has(dateStr)) {
      const current = dailyDataMap.get(dateStr)!;
      current.rentals += Number(r.totalAmount);
      current.revenue += Number(r.totalAmount);
    }
  });

  const chartData = Array.from(dailyDataMap.entries()).map(([date, val]) => ({
    date,
    ...val,
  }));

  // 4. Fetch recent activity (merge rentals, purchases, sellOffers, and kyc)
  const [latestRentals, latestPurchases, latestSellOffers, latestKycs] = await Promise.all([
    prisma.rentalTransaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
    }),
    prisma.purchaseTransaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
    }),
    prisma.sellOffer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.kycDocument.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ]);

  const activities: any[] = [];
  latestRentals.forEach((r) => {
    activities.push({
      id: r.id,
      type: "rental",
      title: "Reservasi Sewa Baru",
      desc: `${r.user.name} memesan ${r.product.name}`,
      time: r.createdAt,
      status: r.status,
      link: `/admin/transaksi/sewa`,
    });
  });

  latestPurchases.forEach((p) => {
    activities.push({
      id: p.id,
      type: "purchase",
      title: "Permintaan Beli Baru",
      desc: `${p.user.name} mengajukan beli ${p.product.name}`,
      time: p.createdAt,
      status: p.status,
      link: `/admin/transaksi/beli`,
    });
  });

  latestSellOffers.forEach((s) => {
    activities.push({
      id: s.id,
      type: "sell",
      title: "Penawaran Gadget Jual",
      desc: `${s.user.name} menawarkan ${s.brand} ${s.model}`,
      time: s.createdAt,
      status: s.status,
      link: `/admin/transaksi/jual`,
    });
  });

  latestKycs.forEach((k) => {
    activities.push({
      id: k.id,
      type: "kyc",
      title: "Dokumen KYC Masuk",
      desc: `${k.user.name} mengunggah berkas KTP`,
      time: k.createdAt,
      status: k.status,
      link: `/admin/kyc`,
    });
  });

  // Sort activities newest first, limit 5
  activities.sort((a, b) => b.time.getTime() - a.time.getTime());
  const topActivities = activities.slice(0, 5);

  const formatRupiah = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  // Greeting based on server time (WIB)
  const hour = new Date().getUTCHours() + 7; // UTC+7
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary mb-1">{greeting}, {adminName} 👋</p>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">Overview Dashboard</h1>
          <p className="text-xs text-text-secondary mt-1">Pantau performa bisnis dan antrian verifikasi toko Anda hari ini.</p>
        </div>
        {(pendingKycCount > 0 || pendingDepositsCount > 0) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            {pendingKycCount + pendingDepositsCount} item butuh perhatian
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Pendapatan Bulan Ini"
          value={formatRupiah(totalRevenueThisMonth)}
          desc="Penjualan & sewa selesai"
          icon={<CircleDollarSign className="w-5 h-5 text-accent-gold" />}
        />
        <StatsCard
          title="Unit Sedang Disewa"
          value={activeRentalsCount.toString()}
          desc="Aktif di tangan pelanggan"
          icon={<Calendar className="w-5 h-5 text-accent-gold" />}
        />
        <StatsCard
          title="Antrian Verifikasi KYC"
          value={pendingKycCount.toString()}
          desc="Pelanggan menunggu review"
          icon={<UserCheck className="w-5 h-5 text-accent-gold" />}
          alert={pendingKycCount > 0}
        />
        <StatsCard
          title="Antrian Deposit Jaminan"
          value={pendingDepositsCount.toString()}
          desc="Menunggu pengecekan bank"
          icon={<ShieldAlert className="w-5 h-5 text-accent-gold" />}
          alert={pendingDepositsCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} />
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-text-primary text-sm">Aksi Cepat & Antrian</h3>
          <div className="space-y-2.5">
            <QuickActionLink
              label="Verifikasi Berkas KYC"
              badge={pendingKycCount}
              href="/admin/kyc"
            />
            <QuickActionLink
              label="Verifikasi Deposit"
              badge={pendingDepositsCount}
              href="/admin/deposit"
            />
            <QuickActionLink
              label="Reservasi Sewa Pending"
              badge={pendingRentalsCount}
              href="/admin/transaksi/sewa"
            />
            <QuickActionLink
              label="Tambah Produk Baru"
              href="/admin/produk/tambah"
              icon={<Package className="w-4 h-4 text-accent-gold" />}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-text-primary text-sm">Aktivitas Terbaru</h3>
        <div className="divide-y divide-border/60">
          {topActivities.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-secondary">Belum ada aktivitas masuk</div>
          ) : (
            topActivities.map((act, idx) => (
              <div key={idx} className="py-3.5 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">{act.title}</span>
                    <span className="text-[10px] text-text-secondary font-mono">
                      {new Date(act.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-text-secondary">{act.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-bg-secondary text-text-primary border border-border text-[9px] capitalize">
                    {act.status}
                  </Badge>
                  <Link href={act.link} className="text-accent-gold hover:text-accent-gold-hover">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  desc,
  icon,
  alert,
  color = "gold",
}: {
  title: string;
  value: string;
  desc: string;
  icon: React.ReactNode;
  alert?: boolean;
  color?: "gold" | "blue" | "green" | "red";
}) {
  const colorMap = {
    gold: "bg-amber-50 border-amber-200",
    blue: "bg-blue-50 border-blue-200",
    green: "bg-emerald-50 border-emerald-200",
    red: "bg-red-50 border-red-200 ring-2 ring-red-100",
  };
  const iconBg = {
    gold: "bg-amber-100",
    blue: "bg-blue-100",
    green: "bg-emerald-100",
    red: "bg-red-100",
  };
  return (
    <Card className={`p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between ${
      alert ? "border-amber-300 ring-2 ring-amber-100" : "border-border"
    }`}>
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">{title}</span>
        <h3 className="font-price font-bold text-text-primary text-xl sm:text-2xl">{value}</h3>
        <p className="text-[10px] text-text-secondary">{desc}</p>
      </div>
      <div className={`p-2.5 rounded-xl ${iconBg[color]} ${alert ? "animate-pulse" : ""}`}>{icon}</div>
    </Card>
  );
}

function QuickActionLink({
  label,
  badge,
  href,
  icon,
}: {
  label: string;
  badge?: number;
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-text-secondary bg-white transition-all duration-200 text-xs font-semibold text-text-primary"
    >
      <div className="flex items-center gap-2">
        {icon || <Clock className="w-4 h-4 text-accent-gold" />}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && badge > 0 && (
          <Badge className="bg-danger text-white rounded-full px-2 py-0.5 text-[10px] animate-pulse">
            {badge}
          </Badge>
        )}
        <ChevronRight className="w-4 h-4 text-text-secondary" />
      </div>
    </Link>
  );
}
