import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";
import Breadcrumb from "@/components/layout/breadcrumb";
import CustomerDetailClient from "./customer-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Detail Pelanggan",
  description: "Informasi profil, riwayat transaksi, berkas KYC, dan status penangguhan akun pelanggan.",
};

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const { id } = await params;

  // 1. Fetch user profile
  const customer = await prisma.user.findUnique({
    where: { id },
  });

  if (!customer || customer.role === "admin") {
    notFound();
  }

  // 2. Fetch user transactions
  const [rentals, purchases, kycDoc] = await Promise.all([
    prisma.rentalTransaction.findMany({
      where: { userId: id },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseTransaction.findMany({
      where: { userId: id },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.kycDocument.findFirst({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // 3. Resolve KYC signed URLs if documents exist
  let enrichedKycDoc = null;
  if (kycDoc) {
    try {
      const [signedKtpFront, signedKtpBack, signedSelfieKtp] = await Promise.all([
        getSignedUrl("kyc", kycDoc.ktpFrontUrl, 3600),
        getSignedUrl("kyc", kycDoc.ktpBackUrl, 3600),
        getSignedUrl("kyc", kycDoc.selfieKtpUrl, 3600),
      ]);
      
      enrichedKycDoc = {
        ...kycDoc,
        signedKtpFront,
        signedKtpBack,
        signedSelfieKtp,
      };
    } catch (err) {
      console.error(`Error resolving signed URLs for customer ${id} KYC document:`, err);
      enrichedKycDoc = {
        ...kycDoc,
        signedKtpFront: "",
        signedKtpBack: "",
        signedSelfieKtp: "",
      };
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Profil & Rekam Jejak Pelanggan
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Tinjau seluruh data diri, berkas kartu identitas KYC yang sah, dan riwayat transaksi sewa / beli pelanggan ini.
        </p>
      </div>

      <CustomerDetailClient
        customer={JSON.parse(JSON.stringify(customer))}
        rentals={JSON.parse(JSON.stringify(rentals))}
        purchases={JSON.parse(JSON.stringify(purchases))}
        kycDoc={JSON.parse(JSON.stringify(enrichedKycDoc))}
      />
    </div>
  );
}
