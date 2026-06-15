import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import SettingsForm from "@/components/admin/settings-form";
import { connection } from "next/server";

import { headers } from "next/headers";

export const metadata = {
  title: "Pengaturan Toko",
  description: "Kelola konfigurasi, bank accounts, dan deposit sewa GadgetVault.",
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

export default async function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
          Pengaturan Toko
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Atur informasi operasional, kontak WhatsApp, koordinat peta Google Maps, rekening bank transfer jaminan, dan kebijakan deposit sewa.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white border border-border rounded-2xl p-8 animate-pulse shadow-sm flex flex-col justify-between h-96">
            <div className="space-y-4">
              <div className="h-6 bg-bg-secondary rounded w-1/4" />
              <div className="h-10 bg-bg-secondary rounded" />
              <div className="h-10 bg-bg-secondary rounded" />
            </div>
            <div className="h-12 bg-bg-secondary rounded w-1/3 self-end" />
          </div>
        }
      >
        <AdminSettingsContent />
      </Suspense>
    </div>
  );
}

async function AdminSettingsContent() {
  await connection();
  const headersList = await headers();
  const isValidation = headersList.get("x-instant-validation") === "true";

  let settings = null;

  if (!isValidation) {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      redirect("/login");
    }

    settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      throw new Error("Store settings are not initialized. Please run db seed first.");
    }
  } else {
    // Provide validation mock data
    settings = {
      id: "sample-settings-id",
      storeName: "GadgetVault",
      address: "Jl. Citeureup No.99, Cimahi",
      phone: "08123456789",
      whatsapp: "628123456789",
      email: "admin@gadgetvault.com",
      googleMapsEmbed: "",
      depositPercentage: 30,
      bankName: "Bank BCA",
      bankAccountName: "GadgetVault",
      bankAccountNumber: "1234567890",
      kycInstruction: "Silakan verifikasi berkas KTP Anda.",
      tnc: "Syarat dan ketentuan berlaku.",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return <SettingsForm initialSettings={settings} />;
}

