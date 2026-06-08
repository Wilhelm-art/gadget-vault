import React from "react";
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

export default async function UserProfilePage() {
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

      <ProfileForm user={JSON.parse(JSON.stringify(user))} stats={stats} />
    </div>
  );
}
