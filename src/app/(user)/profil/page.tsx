import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { User as UserIcon } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import ProfileForm from "./profile-form";

export const metadata = {
  title: "Profil Saya",
  description: "Kelola data diri, kontak, alamat, dan pantau status verifikasi KYC Anda.",
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

export default async function UserProfilePage() {
  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-accent-gold" /> Profil Akun Saya
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Perbarui informasi profil Anda secara berkala untuk menjaga keakuratan data pengiriman dan deposit jaminan sewa.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-96 bg-white border border-border rounded-2xl p-8 animate-pulse flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="h-6 bg-bg-secondary rounded w-1/3" />
              <div className="h-10 bg-bg-secondary rounded" />
              <div className="h-10 bg-bg-secondary rounded" />
            </div>
            <div className="h-12 bg-bg-secondary rounded w-1/4 self-end" />
          </div>
        }
      >
        <ProfileContent />
      </Suspense>
    </div>
  );
}

async function ProfileContent() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/profil");
  }

  const userId = (session.user as any).id;

  // 1. Fetch user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  // 2. Compute user transaction stats
  const [activeRentals, completedRentals, completedPurchases, wishlistCount] = await Promise.all([
    prisma.rentalTransaction.count({
      where: { userId, status: "picked_up" },
    }),
    prisma.rentalTransaction.count({
      where: { userId, status: "completed" },
    }),
    prisma.purchaseTransaction.count({
      where: { userId, status: "completed" },
    }),
    prisma.wishlist.count({
      where: { userId },
    }),
  ]);

  const stats = {
    activeRentals,
    completedTx: completedRentals + completedPurchases,
    wishlistCount,
  };

  return <ProfileForm user={JSON.parse(JSON.stringify(user))} stats={stats} />;
}

