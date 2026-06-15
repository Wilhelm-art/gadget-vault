import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ShoppingBag, Coins, History, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/layout/breadcrumb";
export const metadata = {
  title: "Riwayat Transaksi",
  description: "Lihat dan kelola riwayat pemesanan sewa, pembelian, dan penawaran jual gadget Anda di GadgetVault.",
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      searchParams: { search: "" },
      cookies: [],
      headers: [
        ["x-forwarded-proto", "https"],
        ["x-forwarded-host", "localhost:3000"],
      ],
    },
  ],
};

export default async function UserTransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <History className="h-6 w-6 text-accent-gold" /> Riwayat Transaksi Anda
        </h1>
        <p className="text-xs text-text-secondary">
          Kelola reservasi sewa gadget, request beli, atau taksiran jual gadget bekas Anda.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-96 bg-white border border-border rounded-2xl p-8 animate-pulse shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-6 bg-bg-secondary rounded w-1/4" />
              <div className="h-10 bg-bg-secondary rounded" />
              <div className="h-10 bg-bg-secondary rounded" />
            </div>
            <div className="h-12 bg-bg-secondary rounded w-1/3 self-end" />
          </div>
        }
      >
        <TransactionsContent />
      </Suspense>
    </div>
  );
}

async function TransactionsContent() {
  await connection();
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/transaksi");
  }

  const userId = (session.user as any).id;

  // Fetch all user transactions in parallel
  const [rentals, purchases, sellOffers] = await Promise.all([
    prisma.rentalTransaction.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
        deposit: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseTransaction.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sellOffer.findMany({
      where: { userId },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formatRupiah = (val: any) => {
    if (!val) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const getRentalStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-bg-tertiary text-text-secondary border border-border">Pending Verifikasi</Badge>;
      case "approved":
        return <Badge className="bg-info text-white">Disetujui (Siap Diambil)</Badge>;
      case "picked_up":
        return <Badge className="bg-warning text-white">Sedang Disewa</Badge>;
      case "returned":
        return <Badge className="bg-success text-white">Sudah Dikembalikan</Badge>;
      case "completed":
        return <Badge className="bg-success text-white">Selesai</Badge>;
      case "cancelled":
        return <Badge className="bg-danger text-white">Dibatalkan</Badge>;
      case "rejected":
        return <Badge className="bg-danger text-white">Ditolak</Badge>;
      default:
        return <Badge className="bg-text-muted text-white">{status}</Badge>;
    }
  };

  const getPurchaseStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-bg-tertiary text-text-secondary border border-border">Pending Verifikasi</Badge>;
      case "confirmed":
        return <Badge className="bg-info text-white">Telah Dikonfirmasi</Badge>;
      case "checked":
        return <Badge className="bg-warning text-white">Sedang Dicek Fisik</Badge>;
      case "paid":
        return <Badge className="bg-success text-white">Sudah Dibayar</Badge>;
      case "completed":
        return <Badge className="bg-success text-white">Selesai</Badge>;
      case "cancelled":
        return <Badge className="bg-danger text-white">Dibatalkan</Badge>;
      default:
        return <Badge className="bg-text-muted text-white">{status}</Badge>;
    }
  };

  const getSellStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-bg-tertiary text-text-secondary border border-border">Ditinjau Admin</Badge>;
      case "reviewed":
        return <Badge className="bg-info text-white">Selesai Ditinjau</Badge>;
      case "offered":
        return <Badge className="bg-warning text-white">Harga Ditawarkan</Badge>;
      case "accepted":
        return <Badge className="bg-success text-white">Disetujui Pelanggan</Badge>;
      case "rejected":
        return <Badge className="bg-danger text-white">Ditolak / Batal</Badge>;
      case "completed":
        return <Badge className="bg-success text-white">Selesai Dibayar</Badge>;
      default:
        return <Badge className="bg-text-muted text-white">{status}</Badge>;
    }
  };

  return (
    <TransactionsContainer
      rentals={rentals}
      purchases={purchases}
      sellOffers={sellOffers}
      formatRupiah={formatRupiah}
      getRentalStatusBadge={getRentalStatusBadge}
      getPurchaseStatusBadge={getPurchaseStatusBadge}
      getSellStatusBadge={getSellStatusBadge}
    />
  );
}


// Client container for interactive tab switching
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TransactionsContainer({
  rentals,
  purchases,
  sellOffers,
  formatRupiah,
  getRentalStatusBadge,
  getPurchaseStatusBadge,
  getSellStatusBadge,
}: {
  rentals: any[];
  purchases: any[];
  sellOffers: any[];
  formatRupiah: (val: any) => string;
  getRentalStatusBadge: (status: string) => React.ReactNode;
  getPurchaseStatusBadge: (status: string) => React.ReactNode;
  getSellStatusBadge: (status: string) => React.ReactNode;
}) {
  return (
    <Tabs defaultValue="sewa" className="w-full">
      <TabsList className="bg-bg-secondary border border-border p-1 rounded-xl mb-6 flex w-full max-w-md">
        <TabsTrigger
          value="sewa"
          className="flex-1 rounded-lg text-xs font-semibold py-2.5 data-[state=active]:bg-white data-[state=active]:text-text-primary data-[state=active]:shadow-sm transition-all"
        >
          <Calendar className="w-3.5 h-3.5 mr-2 inline" />
          Sewa ({rentals.length})
        </TabsTrigger>
        <TabsTrigger
          value="beli"
          className="flex-1 rounded-lg text-xs font-semibold py-2.5 data-[state=active]:bg-white data-[state=active]:text-text-primary data-[state=active]:shadow-sm transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-2 inline" />
          Beli ({purchases.length})
        </TabsTrigger>
        <TabsTrigger
          value="jual"
          className="flex-1 rounded-lg text-xs font-semibold py-2.5 data-[state=active]:bg-white data-[state=active]:text-text-primary data-[state=active]:shadow-sm transition-all"
        >
          <Coins className="w-3.5 h-3.5 mr-2 inline" />
          Jual ({sellOffers.length})
        </TabsTrigger>
      </TabsList>

      {/* RENTALS TAB */}
      <TabsContent value="sewa" className="space-y-4 animate-fade-in">
        {rentals.length === 0 ? (
          <EmptyState message="Anda belum pernah mengajukan reservasi sewa gadget." />
        ) : (
          rentals.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-text-muted/40 transition-colors duration-200"
            >
              <div className="flex gap-4">
                <div className="relative w-16 h-16 rounded-xl border border-border overflow-hidden bg-bg-secondary shrink-0">
                  {item.product.images?.[0] ? (
                    <Image
                      src={item.product.images[0].imageUrl}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-accent-gold-light flex items-center justify-center text-xs font-bold text-accent-gold">
                      GV
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-accent-gold tracking-wide uppercase">
                      {item.transactionCode}
                    </span>
                    {getRentalStatusBadge(item.status)}
                    {item.deposit && item.deposit.status === "pending" && !item.deposit.transferProofUrl && (
                      <Badge className="bg-danger text-white text-[9px] animate-pulse">Butuh Deposit</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-text-primary text-sm truncate">{item.product.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {new Date(item.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} -{" "}
                    {new Date(item.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}({item.durationDays} hari)
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-between sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border/60">
                <div className="text-right">
                  <span className="text-[10px] text-text-secondary block">Total Biaya</span>
                  <span className="font-price font-bold text-text-primary text-sm">
                    {formatRupiah(item.totalAmount)}
                  </span>
                </div>
                <Link
                  href={`/transaksi/${item.id}?type=sewa`}
                  className="text-xs font-semibold text-accent-gold hover:text-accent-gold-hover flex items-center gap-1 mt-2 sm:mt-1 hover:underline"
                >
                  Detail Transaksi <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </TabsContent>

      {/* PURCHASES TAB */}
      <TabsContent value="beli" className="space-y-4 animate-fade-in">
        {purchases.length === 0 ? (
          <EmptyState message="Anda belum pernah mengajukan permintaan beli gadget." />
        ) : (
          purchases.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-text-muted/40 transition-colors duration-200"
            >
              <div className="flex gap-4">
                <div className="relative w-16 h-16 rounded-xl border border-border overflow-hidden bg-bg-secondary shrink-0">
                  {item.product.images?.[0] ? (
                    <Image
                      src={item.product.images[0].imageUrl}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-accent-gold-light flex items-center justify-center text-xs font-bold text-accent-gold">
                      GV
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-accent-gold tracking-wide uppercase">
                      {item.transactionCode}
                    </span>
                    {getPurchaseStatusBadge(item.status)}
                  </div>
                  <h3 className="font-bold text-text-primary text-sm truncate">{item.product.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Tanggal: {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-between sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border/60">
                <div className="text-right">
                  <span className="text-[10px] text-text-secondary block">Harga Beli</span>
                  <span className="font-price font-bold text-text-primary text-sm">
                    {formatRupiah(item.amount)}
                  </span>
                </div>
                <Link
                  href={`/transaksi/${item.id}?type=beli`}
                  className="text-xs font-semibold text-accent-gold hover:text-accent-gold-hover flex items-center gap-1 mt-2 sm:mt-1 hover:underline"
                >
                  Detail Transaksi <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </TabsContent>

      {/* SELL OFFERS TAB */}
      <TabsContent value="jual" className="space-y-4 animate-fade-in">
        {sellOffers.length === 0 ? (
          <EmptyState message="Anda belum pernah mengajukan penawaran jual gadget." />
        ) : (
          sellOffers.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-text-muted/40 transition-colors duration-200"
            >
              <div className="flex gap-4">
                <div className="relative w-16 h-16 rounded-xl border border-border overflow-hidden bg-bg-secondary shrink-0">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0].imageUrl}
                      alt={item.itemName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-accent-gold-light flex items-center justify-center text-xs font-bold text-accent-gold">
                      GV
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[9px] bg-accent-gold-light text-accent-gold-hover px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      JUAL
                    </span>
                    {getSellStatusBadge(item.status)}
                  </div>
                  <h3 className="font-bold text-text-primary text-sm truncate">{item.itemName}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Kondisi: {item.condition === "like_new" ? "Mulus Like New" : item.condition === "good" ? "Bagus (Good)" : item.condition === "fair" ? "Normal (Fair)" : "Kurang (Poor)"}
                    {" · "}
                    {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-between sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border/60">
                <div className="text-right">
                  <span className="text-[10px] text-text-secondary block">Taksiran Harga Toko</span>
                  <span className="font-price font-bold text-text-primary text-sm">
                    {item.offeredPrice ? formatRupiah(item.offeredPrice) : "Menunggu Admin"}
                  </span>
                </div>
                <Link
                  href={`/transaksi/${item.id}?type=jual`}
                  className="text-xs font-semibold text-accent-gold hover:text-accent-gold-hover flex items-center gap-1 mt-2 sm:mt-1 hover:underline"
                >
                  Detail Transaksi <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-white border border-border rounded-2xl p-6">
      <History className="h-10 w-10 text-text-muted mx-auto mb-3" />
      <p className="text-xs text-text-secondary">{message}</p>
    </div>
  );
}
