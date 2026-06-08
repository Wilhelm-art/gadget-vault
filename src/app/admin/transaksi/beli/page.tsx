import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import PurchaseQueueClient from "./purchase-queue-client";

export const metadata = {
  title: "Kelola Transaksi Beli",
  description: "Daftar pengajuan pembelian gadget offline di GadgetVault.",
};

export default async function AdminPurchasesQueuePage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  // Fetch all purchases
  const purchases = await prisma.purchaseTransaction.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      product: { select: { name: true, brand: true, model: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Manajemen Transaksi Beli
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pantau pemesanan pembelian unit dari katalog, verifikasi kondisi fisik offline di toko, dan selesaikan transaksi pembayaran.
        </p>
      </div>

      <PurchaseQueueClient initialPurchases={purchases} />
    </div>
  );
}
