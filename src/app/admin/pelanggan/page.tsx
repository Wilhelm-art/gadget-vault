import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import CustomerListClient from "./customer-list-client";

export const metadata = {
  title: "Daftar Pelanggan",
  description: "Manajemen data pelanggan, status KYC, dan blacklist di GadgetVault.",
};

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  // Fetch all customer users with count of rentals & purchases
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      province: true,
      kycStatus: true,
      isBlacklisted: true,
      createdAt: true,
      _count: {
        select: {
          rentals: true,
          purchases: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Daftar Pelanggan
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pantau status verifikasi KYC pelanggan, track rekam jejak jumlah transaksi, dan batasi akses pelanggan bermasalah.
        </p>
      </div>

      <CustomerListClient initialCustomers={JSON.parse(JSON.stringify(customers))} />
    </div>
  );
}
