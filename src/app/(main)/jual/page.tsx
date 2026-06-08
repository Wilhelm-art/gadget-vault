import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCachedCategories } from "@/lib/queries";
import Breadcrumb from "@/components/layout/breadcrumb";
import SellForm from "@/components/sell/sell-form";

export const metadata = {
  title: "Jual Gadget Anda",
  description: "Jual handphone, kamera, drone, atau aksesoris bekas Anda ke toko GadgetVault Cimahi/Bandung dengan taksiran harga tinggi and pembayaran instan COD.",
};

export default async function SellToStorePage() {
  // 1. Authenticate user
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/jual");
  }

  // 2. Fetch categories for selector (Cached)
  const categories = await getCachedCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb />

      <div className="mt-4 space-y-6">
        {/* Header Section */}
        <div className="space-y-2 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Jual Gadget Bekas Anda ke Toko
          </h1>
          <p className="text-sm text-text-secondary">
            Punya HP, kamera, drone, atau aksesoris nganggur? Ajukan spesifikasi dan foto gadget Anda di sini. Admin kami akan melakukan penaksiran harga. Jika sepakat, silakan bawa perangkat untuk verifikasi fisik final dan cairkan dana tunai offline.
          </p>
        </div>

        {/* Multi-step Form */}
        <SellForm categories={categories} />
      </div>
    </div>
  );
}
