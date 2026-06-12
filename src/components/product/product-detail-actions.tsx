"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Calendar, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductDetailActionsProps {
  productId: string;
  productSlug: string;
  isRentable: boolean;
  isSellable: boolean;
  isLoggedIn: boolean;
  initialInWishlist: boolean;
  status: string;
}

export default function ProductDetailActions({
  productId,
  productSlug,
  isRentable,
  isSellable,
  isLoggedIn,
  initialInWishlist,
  status,
}: ProductDetailActionsProps) {
  const router = useRouter();
  
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      toast.error("Silakan masuk terlebih dahulu.");
      router.push(`/login?callbackUrl=/katalog/${productSlug}`);
      return;
    }

    setIsWishlistLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const data = await response.json();
        setInWishlist(data.inWishlist);
        if (data.inWishlist) {
          toast.success("Produk berhasil ditambahkan ke Wishlist.");
        } else {
          toast.success("Produk dihapus dari Wishlist.");
        }
      } else {
        toast.error("Gagal memperbarui Wishlist.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleRentClick = () => {
    if (!isLoggedIn) {
      toast.error("Silakan masuk terlebih dahulu.");
      router.push(`/login?callbackUrl=/sewa/${productSlug}`);
      return;
    }
    router.push(`/sewa/${productSlug}`);
  };

  const handleBuyClick = () => {
    if (!isLoggedIn) {
      toast.error("Silakan masuk terlebih dahulu.");
      router.push(`/login?callbackUrl=/katalog/${productSlug}`);
      return;
    }
    setIsBuyModalOpen(true);
  };

  const confirmPurchase = async () => {
    setIsPurchasing(true);
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Permintaan pembelian berhasil dikirim!");
        setIsBuyModalOpen(false);
        router.push("/transaksi");
      } else {
        toast.error(data.message || "Gagal mengajukan pembelian.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem saat mengajukan pembelian.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const isAvailable = status === "ready";

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isRentable && (
          <Button
            onClick={handleRentClick}
            disabled={!isAvailable}
            className="flex-1 bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white py-6 rounded-xl text-sm font-semibold shadow-sm hover:from-accent-gold-hover hover:to-accent-gold transition-colors gap-2"
          >
            <Calendar className="h-5 w-5" />
            Sewa Sekarang
          </Button>
        )}

        {isSellable && (
          <Button
            variant="outline"
            onClick={handleBuyClick}
            disabled={!isAvailable}
            className="flex-1 border-accent-gold text-accent-gold hover:bg-accent-gold-light py-6 rounded-xl text-sm font-semibold gap-2"
          >
            <ShoppingBag className="h-5 w-5" />
            Beli Sekarang
          </Button>
        )}
      </div>

      {/* Wishlist button */}
      <Button
        variant="ghost"
        disabled={isWishlistLoading}
        onClick={handleWishlistToggle}
        className={`w-full py-5 rounded-xl border border-border flex items-center justify-center gap-2 hover:bg-bg-secondary transition-colors ${
          inWishlist ? "text-danger hover:text-danger" : "text-text-secondary"
        }`}
      >
        <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
        <span>{inWishlist ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}</span>
      </Button>

      {/* Info Warning */}
      {!isAvailable && (
        <div className="flex gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Saat ini perangkat sedang tidak tersedia untuk sewa atau beli.</span>
        </div>
      )}

      {/* Purchase Dialog */}
      <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
        <DialogContent className="bg-white rounded-2xl border border-border p-6 max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary">
              Konfirmasi Pengajuan Beli
            </DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Transaksi bersifat **offline-first**. Anda mengajukan permintaan beli, lalu Anda wajib datang ke toko untuk memeriksa fisik barang dan melakukan pembayaran langsung.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-bg-secondary p-4 rounded-xl border border-border space-y-2 text-xs text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary">ℹ️ Informasi Penting:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Permintaan ini akan ditinjau oleh admin dalam 1x24 jam.</li>
              <li>Barang akan di-booking sementara untuk Anda selama maksimal 2 hari kerja setelah dikonfirmasi admin.</li>
              <li>Handovers dan pembayaran dilakukan offline di alamat toko GadgetVault.</li>
            </ul>
          </div>

          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsBuyModalOpen(false)}
              disabled={isPurchasing}
              className="text-text-secondary"
            >
              Batal
            </Button>
            <Button
              onClick={confirmPurchase}
              disabled={isPurchasing}
              className="bg-accent-gold text-white hover:bg-accent-gold-hover"
            >
              {isPurchasing ? "Memproses..." : "Ajukan Beli"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
