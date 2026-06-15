import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import CustomerListClient from "./customer-list-client";
import { connection } from "next/server";

import { headers } from "next/headers";

export const metadata = {
  title: "Daftar Pelanggan",
  description: "Manajemen data pelanggan, status KYC, dan blacklist di GadgetVault.",
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
        ["x-instant-validation", "true"],
      ],
    },
  ],
};

export default async function AdminCustomersPage() {
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

      <Suspense
        fallback={
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-200 rounded" />
              ))}
            </div>
          </div>
        }
      >
        <AdminCustomersContent />
      </Suspense>
    </div>
  );
}

async function AdminCustomersContent() {
  await connection();
  const headersList = await headers();
  const isValidation = headersList.get("x-instant-validation") === "true";

  if (!isValidation) {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      redirect("/login");
    }
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

  return <CustomerListClient initialCustomers={JSON.parse(JSON.stringify(customers))} />;
}

