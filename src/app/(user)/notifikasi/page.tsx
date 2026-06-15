import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import NotificationsClient from "./notifications-client";
import { connection } from "next/server";

export const metadata = {
  title: "Notifikasi Saya",
  description: "Daftar notifikasi status KYC, reservasi sewa, dan pengajuan beli di GadgetVault.",
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
      ],
    },
  ],
};

export default async function UserNotificationsPage() {
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

      <Suspense
        fallback={
          <div className="h-96 bg-white border border-border rounded-2xl p-8 animate-pulse shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-6 bg-bg-secondary rounded w-1/4" />
              <div className="h-10 bg-bg-secondary rounded" />
              <div className="h-10 bg-bg-secondary rounded" />
            </div>
            <div className="h-12 bg-bg-secondary rounded w-1/3 self-end" />
          </div>
        }
      >
        <NotificationsContent />
      </Suspense>
    </div>
  );
}

async function NotificationsContent() {
  await connection();
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

  return <NotificationsClient initialNotifications={notifications} />;
}

