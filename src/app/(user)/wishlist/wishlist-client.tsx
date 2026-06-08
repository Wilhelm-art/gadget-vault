"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Smartphone, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface WishlistClientProps {
  initialWishlists: any[];
}

export default function WishlistClient({ initialWishlists }: WishlistClientProps) {
  const [wishlist, setWishlist] = useState(initialWishlists);

  const handleRemoveWishlist = async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.inWishlist) {
          toast.success("Produk berhasil dihapus dari Wishlist.");
          setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
        }
      } else {
        toast.error("Gagal memperbarui Wishlist.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const formatRupiah = (val: any) => {
    if (!val) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-success text-white text-[10px]">Tersedia</Badge>;
      case "rented":
        return <Badge className="bg-warning text-white text-[10px]">Disewa</Badge>;
      case "sold":
        return <Badge className="bg-danger text-white text-[10px]">Sold</Badge>;
      default:
        return <Badge className="bg-text-muted text-white text-[10px]">Habis</Badge>;
    }
  };

  return (
    <div>
      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-2xl p-8 max-w-md mx-auto">
          <Heart className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-1">Wishlist Kosong</h3>
          <p className="text-sm text-text-secondary">
            Anda belum menambahkan gadget apa pun ke daftar favorit Anda. Jelajahi katalog dan klik ikon hati untuk menyimpan produk.
          </p>
          <Link href="/katalog" className="inline-block mt-4">
            <Button className="bg-accent-gold text-white hover:bg-accent-gold-hover rounded-xl px-5 text-xs font-semibold">
              Buka Katalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in-up">
          {wishlist.map((item) => {
            const prod = item.product;
            const hasImage = prod.images?.[0]?.imageUrl;

            return (
              <div
                key={item.id}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-text-muted/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="relative aspect-[4/3] bg-bg-secondary overflow-hidden border-b border-border/60">
                  <img
                    src={hasImage || "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=300"}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      type="button"
                      onClick={() => handleRemoveWishlist(prod.id)}
                      className="p-2.5 rounded-full bg-white/95 text-danger border border-border/40 hover:scale-110 shadow-sm transition-all duration-200"
                    >
                      <Heart className="w-4.5 h-4.5 fill-current" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 z-10">
                    {getStatusBadge(prod.status)}
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-bg-secondary text-text-secondary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {prod.brand}
                    </span>
                    <h3 className="font-bold text-text-primary text-sm line-clamp-1 group-hover:text-accent-gold-hover transition-colors">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex justify-between items-center text-xs">
                    <div>
                      {prod.isRentable && prod.rentPriceDaily && (
                        <div className="text-[11px] font-bold text-accent-gold-hover">
                          {formatRupiah(prod.rentPriceDaily)} <span className="text-[9px] font-normal text-text-secondary">/hari</span>
                        </div>
                      )}
                      {prod.isSellable && prod.sellPrice && (
                        <div className="text-[10px] text-text-secondary mt-0.5">
                          Beli: {formatRupiah(prod.sellPrice)}
                        </div>
                      )}
                    </div>
                    <Link href={`/katalog/${prod.slug}`}>
                      <Button
                        variant="ghost"
                        className="h-8 p-1.5 hover:bg-bg-secondary text-xs font-semibold gap-1 text-text-secondary"
                      >
                        Detail <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
