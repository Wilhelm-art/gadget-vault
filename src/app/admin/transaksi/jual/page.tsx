import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import SellQueueClient from "./sell-queue-client";

export const metadata = {
  title: "Kelola Penawaran Jual",
  description: "Daftar pengajuan penjualan gadget dari pelanggan ke toko GadgetVault.",
};

export default async function AdminSellQueuePage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  // Fetch all sell offers
  const offers = await prisma.sellOffer.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Manajemen Penawaran Jual Gadget
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Review kondisi fisik unit yang diunggah oleh pelanggan, berikan taksiran harga beli toko, dan selesaikan pencairan dana secara offline.
        </p>
      </div>

      <SellQueueClient initialOffers={JSON.parse(JSON.stringify(offers))} />
    </div>
  );
}
