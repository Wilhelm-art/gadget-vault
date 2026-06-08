import React from "react";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import WishlistClient from "./wishlist-client";

export const metadata = {
  title: "Wishlist Saya",
  description: "Daftar produk gadget favorit yang Anda simpan di GadgetVault.",
};

export default async function UserWishlistPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/wishlist");
  }

  const userId = (session.user as any).id;

  // Fetch wishlists for the logged in user
  const wishlists = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display flex items-center gap-2">
          <Heart className="h-6 w-6 text-accent-gold fill-current" /> Gadget Favorit Saya
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pantau harga sewa/beli real-time dan ketersediaan unit sewa untuk gadget-gadget pilihan yang telah Anda simpan.
        </p>
      </div>

      <WishlistClient initialWishlists={wishlists} />
    </div>
  );
}
