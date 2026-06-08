"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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

interface AdminProductActionsProps {
  productId: string;
  name: string;
}

export default function AdminProductActions({ productId, name }: AdminProductActionsProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(`Produk "${name}" berhasil dihapus.`);
        setIsConfirmOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.message || "Gagal menghapus produk.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-danger hover:text-danger hover:bg-danger/10 cursor-pointer"
        onClick={() => setIsConfirmOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-white rounded-2xl border border-border p-6 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary">Hapus Produk</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Apakah Anda yakin ingin menghapus produk **{name}**? Tindakan ini permanen dan tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isDeleting}
              className="text-text-secondary"
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-danger text-white hover:bg-danger/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
