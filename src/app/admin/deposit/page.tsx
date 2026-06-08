import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";
import Breadcrumb from "@/components/layout/breadcrumb";
import DepositQueueClient from "./deposit-queue-client";

export const metadata = {
  title: "Kelola Uang Jaminan",
  description: "Manajemen deposit sewa luar kota GadgetVault.",
};

export default async function AdminDepositQueuePage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/login");
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

      <DepositQueueClient initialDeposits={enrichedDeposits} />
    </div>
  );
}
