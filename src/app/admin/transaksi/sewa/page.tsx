import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import RentalQueueClient from "./rental-queue-client";

export const metadata = {
  title: "Kelola Transaksi Sewa",
  description: "Antrian dan riwayat transaksi sewa gadget GadgetVault.",
};

export default async function AdminRentalsQueuePage() {
  // 1. Authenticate admin
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  // 2. Fetch rental transactions
  const rentals = await prisma.rentalTransaction.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true, city: true, province: true, kycStatus: true } },
      product: { select: { name: true, brand: true, model: true } },
      deposit: true,
      photos: { orderBy: { takenAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Manajemen Transaksi Sewa
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pantau penyewaan aktif, approve reservasi baru, dan kelola proses serah-terima unit dengan dokumentasi foto.
        </p>
      </div>

      <RentalQueueClient initialRentals={rentals} />
    </div>
  );
}
