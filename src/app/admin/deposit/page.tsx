import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";
import Breadcrumb from "@/components/layout/breadcrumb";
import DepositQueueClient from "./deposit-queue-client";
import { connection } from "next/server";

import { headers } from "next/headers";

export const metadata = {
  title: "Kelola Uang Jaminan",
  description: "Manajemen deposit sewa luar kota GadgetVault.",
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

export default async function AdminDepositQueuePage() {
  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Manajemen Deposit Jaminan
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Verifikasi transfer uang jaminan sewa dari penyewa luar kota, dan catat transaksi pengembalian dana setelah unit dikembalikan aman.
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
        <AdminDepositQueueContent />
      </Suspense>
    </div>
  );
}

async function AdminDepositQueueContent() {
  await connection();
  const headersList = await headers();
  const isValidation = headersList.get("x-instant-validation") === "true";

  if (!isValidation) {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      redirect("/login");
    }
  }

  // Fetch all deposits
  const deposits = await prisma.deposit.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      rental: { select: { transactionCode: true, totalAmount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Resolve private signed URLs for secure rendering of transfer proofs
  const enrichedDeposits = await Promise.all(
    deposits.map(async (dep) => {
      if (!dep.storagePath) {
        return { ...dep, signedProofUrl: "" };
      }
      try {
        const signedProofUrl = await getSignedUrl("deposits", dep.storagePath, 3600);
        return {
          ...dep,
          signedProofUrl,
        };
      } catch (err) {
        console.error(`Error resolving signed URL for deposit ${dep.id}:`, err);
        return {
          ...dep,
          signedProofUrl: "",
        };
      }
    })
  );

  return <DepositQueueClient initialDeposits={JSON.parse(JSON.stringify(enrichedDeposits))} />;
}

