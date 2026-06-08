import React from "react";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import NotificationsClient from "./notifications-client";

export const metadata = {
  title: "Notifikasi Saya",
  description: "Daftar notifikasi status KYC, reservasi sewa, dan pengajuan beli di GadgetVault.",
};

export default async function UserNotificationsPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/notifikasi");
  }

  const userId = (session.user as any).id;

  // Fetch notifications
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display flex items-center gap-2">
          <Bell className="h-6 w-6 text-accent-gold" /> Notifikasi & Info
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pantau pemberitahuan real-time terkait persetujuan berkas KYC, konfirmasi transaksi sewa, taksiran penawaran harga jual, dan deposit jaminan.
        </p>
      </div>

      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
