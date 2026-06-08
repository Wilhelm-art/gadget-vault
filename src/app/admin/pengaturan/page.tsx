import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import SettingsForm from "@/components/admin/settings-form";

export const metadata = {
  title: "Pengaturan Toko",
  description: "Kelola konfigurasi, bank accounts, dan deposit sewa GadgetVault.",
};

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  // Fetch store settings record
  const settings = await prisma.storeSettings.findFirst();
  if (!settings) {
    throw new Error("Store settings are not initialized. Please run db seed first.");
  }

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

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
