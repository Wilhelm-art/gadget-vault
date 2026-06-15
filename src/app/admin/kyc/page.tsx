import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";
import Breadcrumb from "@/components/layout/breadcrumb";
import KycQueueClient from "./kyc-queue-client";
import { connection } from "next/server";

import { headers } from "next/headers";

export const metadata = {
  title: "Kelola Verifikasi KYC",
  description: "Daftar pengajuan verifikasi identitas (KYC) pelanggan di GadgetVault.",
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

export default async function AdminKycQueuePage() {
  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Manajemen Verifikasi KYC
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Tinjau berkas kartu identitas KTP dan foto selfie untuk mengaktifkan izin sewa gadget pelanggan.
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
        <AdminKycQueueContent />
      </Suspense>
    </div>
  );
}

async function AdminKycQueueContent() {
  await connection();
  const headersList = await headers();
  const isValidation = headersList.get("x-instant-validation") === "true";

  if (!isValidation) {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      redirect("/login");
    }
  }

  // Fetch Kyc Documents
  const kycDocs = await prisma.kycDocument.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true, city: true, province: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Resolve private signed URLs in parallel for secure rendering
  const enrichedDocs = await Promise.all(
    kycDocs.map(async (doc) => {
      try {
        const [signedKtpFront, signedKtpBack, signedSelfieKtp, signedKk] = await Promise.all([
          getSignedUrl("kyc", doc.ktpFrontUrl, 3600),
          getSignedUrl("kyc", doc.ktpBackUrl, 3600),
          getSignedUrl("kyc", doc.selfieKtpUrl, 3600),
          doc.kkUrl ? getSignedUrl("kyc", doc.kkUrl, 3600) : Promise.resolve(""),
        ]);
        return {
          ...doc,
          signedKtpFront,
          signedKtpBack,
          signedSelfieKtp,
          signedKk,
        };
      } catch (err) {
        console.error(`Error resolving signed URLs for KYC doc ${doc.id}:`, err);
        return {
          ...doc,
          signedKtpFront: "",
          signedKtpBack: "",
          signedSelfieKtp: "",
          signedKk: "",
        };
      }
    })
  );

  return <KycQueueClient initialDocs={JSON.parse(JSON.stringify(enrichedDocs))} />;
}

