import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Users, UserCheck, Calendar, CircleDollarSign, Clock, 
  ArrowRight, ShieldAlert, BadgePercent, CheckCircle, Package,
  ChevronRight
} from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RevenueChart from "@/components/admin/revenue-chart";

export const metadata = {
  title: "Admin Overview",
  description: "Dashboard panel admin GadgetVault - Cimahi",
};

export default async function AdminDashboardOverview() {
  // 1. Authenticate admin
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">Overview Dashboard</h1>
        <p className="text-xs text-text-secondary">Selamat datang kembali Admin. Pantau performa bisnis dan antrian verifikasi Anda.</p>
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
}: {
  title: string;
  value: string;
  desc: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <Card className={`p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between ${
      alert ? "border-amber-300 ring-2 ring-amber-100" : "border-border"
    }`}>
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">{title}</span>
        <h3 className="font-price font-bold text-text-primary text-xl sm:text-2xl">{value}</h3>
        <p className="text-[10px] text-text-secondary">{desc}</p>
      </div>
      <div className={`p-2.5 rounded-xl bg-accent-gold-light ${alert ? "animate-pulse" : ""}`}>{icon}</div>
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
