"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Check, X, Eye, Info, Clock, 
  Smartphone, User, Coins, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SellQueueClientProps {
  initialOffers: any[];
}

export default function SellQueueClient({ initialOffers }: SellQueueClientProps) {
  const router = useRouter();
  const [offers, setOffers] = useState(initialOffers);
  
  // Modal states
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form states
  const [adminNotes, setAdminNotes] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");

  const formatRupiah = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const handleOpenDetail = (offer: any) => {
    setSelectedOffer(offer);
    setAdminNotes(offer.adminNotes || "");
    setOfferedPrice(offer.offeredPrice ? offer.offeredPrice.toString() : "");
    setIsDetailOpen(true);
  };

  const handleSaveOffer = async (status: string) => {
    if (status === "offered" && !offeredPrice) {
      toast.error("Mohon tentukan taksiran harga penawaran.");
      return;
    }

    setIsActionLoading(true);
    try {
      const payload: any = {
        status,
        adminNotes,
        offeredPrice: offeredPrice ? parseFloat(offeredPrice) : null,
      };

      const res = await fetch(`/api/sell-offers/${selectedOffer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Taksiran harga berhasil disimpan.`);
        setIsDetailOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Gagal menyimpan taksiran.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-bg-tertiary text-text-secondary border border-border">Ditinjau</Badge>;
      case "reviewed":
        return <Badge className="bg-info text-white">Ditinjau</Badge>;
      case "offered":
        return <Badge className="bg-warning text-white">Ditawarkan</Badge>;
      case "accepted":
        return <Badge className="bg-success text-white">Disetujui Pelanggan</Badge>;
      case "rejected":
        return <Badge className="bg-danger text-white">Ditolak / Batal</Badge>;
      case "completed":
        return <Badge className="bg-success text-white">Selesai Dibayar</Badge>;
      default:
        return <Badge className="bg-text-muted text-white">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60">
          <h3 className="font-bold text-text-primary text-sm">Penawaran Jual Gadget Pelanggan</h3>
          <p className="text-[11px] text-text-secondary">Taksir harga gadget bekas dan lakukan pencairan dana offline</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-xs text-left">
            <thead className="bg-bg-secondary text-text-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">ID Pengajuan</th>
                <th className="px-5 py-3">Pelanggan</th>
                <th className="px-5 py-3">Nama Gadget</th>
                <th className="px-5 py-3">Kondisi Fisik</th>
                <th className="px-5 py-3 text-right">Ekspektasi User</th>
                <th className="px-5 py-3 text-right">Taksiran Toko</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-text-primary">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-text-secondary">
                    Belum ada pengajuan penjualan dari pelanggan.
                  </td>
                </tr>
              ) : (
                offers.map((o: any) => (
                  <tr key={o.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-accent-gold-hover text-[10px]">
                      {o.id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{o.user.name}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{o.user.phone || "-"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium max-w-[150px] truncate">{o.itemName}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{o.brand} · {o.model}</div>
                    </td>
                    <td className="px-5 py-4 capitalize font-semibold">
                      {o.condition === "like_new" ? "Like New" : o.condition === "good" ? "Bagus" : o.condition === "fair" ? "Fair" : "Poor"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {o.askingPrice ? formatRupiah(o.askingPrice) : "-"}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-accent-gold-hover">
                      {o.offeredPrice ? formatRupiah(o.offeredPrice) : "Belum Ditaksir"}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(o.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenDetail(o)}
                          className="p-1 h-7 rounded-lg hover:bg-bg-secondary border border-border"
                        >
                          <Eye className="w-3.5 h-3.5 text-text-secondary" />
                        </Button>
                        
                        {/* Quick transitions */}
                        {o.status === "pending" && (
                          <Button
                            onClick={() => handleOpenDetail(o)}
                            className="bg-accent-gold hover:bg-accent-gold-hover text-white text-[10px] h-7 px-2.5 rounded-lg font-bold"
                          >
                            Taksir Harga
                          </Button>
                        )}

                        {o.status === "accepted" && (
                          <Button
                            onClick={() => {
                              setSelectedOffer(o);
                              setAdminNotes(o.adminNotes || "");
                              setOfferedPrice(o.offeredPrice.toString());
                              handleSaveOffer("completed");
                            }}
                            className="bg-success hover:bg-success/90 text-white text-[10px] h-7 px-2.5 rounded-lg font-bold shadow-sm"
                          >
                            Bayar Tunai
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white rounded-2xl border border-border p-6 max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-primary">
              Rincian Pengajuan Jual Gadget
            </DialogTitle>
            <DialogDescription className="text-[11px] text-text-secondary">
              Review kondisi fisik barang dan berikan taksiran harga.
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-3 bg-bg-secondary p-4 rounded-xl border border-border">
                <div>
                  <span className="text-text-secondary">ID Transaksi:</span>
                  <p className="font-bold text-text-primary font-mono mt-0.5">{selectedOffer.id}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Status:</span>
                  <p className="mt-0.5">{getStatusBadge(selectedOffer.status)}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Nama Pengaju:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedOffer.user.name}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Nomor HP Pengaju:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedOffer.user.phone || "-"}</p>
                </div>
              </div>

              <div className="border border-border rounded-xl p-4 bg-white space-y-2">
                <span className="font-bold text-text-primary block">Informasi Gadget & Kelengkapan:</span>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Nama Perangkat:</span>
                  <span className="font-semibold text-text-primary">{selectedOffer.itemName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Brand & Model:</span>
                  <span className="font-semibold text-text-primary">{selectedOffer.brand} · {selectedOffer.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Kondisi Fisik:</span>
                  <span className="font-semibold text-text-primary capitalize">{selectedOffer.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Aksesoris & Box:</span>
                  <span className="font-semibold text-text-primary">{selectedOffer.completeness}</span>
                </div>
              </div>

              {/* Photos Gallery */}
              {selectedOffer.images && selectedOffer.images.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-text-primary block">Foto Kondisi Unit ({selectedOffer.images.length}):</span>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedOffer.images.map((img: any) => (
                      <a
                        key={img.id}
                        href={img.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square rounded-lg border border-border overflow-hidden bg-bg-secondary block"
                      >
                        <div className="relative w-full h-full">
                          <Image 
                            src={img.imageUrl} 
                            alt="Offer Item" 
                            fill 
                            sizes="150px" 
                            className="object-cover" 
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* User Description notes */}
              <div className="bg-bg-secondary p-3 rounded-xl border border-border">
                <span className="font-bold text-text-primary block mb-1">Deskripsi & Minus User:</span>
                <p className="text-text-secondary text-[11px] leading-relaxed whitespace-pre-line">
                  {selectedOffer.description}
                </p>
              </div>

              {/* Input for Offered Price (Taksiran Harga) */}
              {["pending", "reviewed", "offered"].includes(selectedOffer.status) && (
                <div className="space-y-1.5 border-t border-border/60 pt-3">
                  <label className="text-[10px] font-bold text-text-secondary uppercase block">Taksiran Harga Penawaran Toko (Rupiah) *</label>
                  <div className="relative rounded-lg overflow-hidden max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-text-secondary">Rp</span>
                    <Input
                      type="number"
                      placeholder="Contoh: 7500000"
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(e.target.value)}
                      className="pl-8 text-xs font-semibold rounded-lg border-border"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Catatan Admin / Negosiasi / Catatan Fisik</label>
                <textarea
                  placeholder="Tulis catatan admin..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full rounded-xl border border-border p-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  rows={2}
                />
              </div>

              <DialogFooter className="flex justify-between gap-2 border-t border-border/60 pt-4">
                {selectedOffer.status !== "completed" && selectedOffer.status !== "rejected" && (
                  <Button
                    onClick={() => handleSaveOffer("rejected")}
                    disabled={isActionLoading}
                    className="bg-danger text-white hover:bg-danger/90 text-xs rounded-xl"
                  >
                    Tolak Penawaran
                  </Button>
                )}
                
                {["pending", "reviewed", "offered"].includes(selectedOffer.status) ? (
                  <Button
                    onClick={() => handleSaveOffer("offered")}
                    disabled={isActionLoading}
                    className="bg-accent-gold text-white hover:bg-accent-gold-hover text-xs rounded-xl ml-auto"
                  >
                    Kirim Harga Penawaran
                  </Button>
                ) : selectedOffer.status === "accepted" ? (
                  <Button
                    onClick={() => handleSaveOffer("completed")}
                    disabled={isActionLoading}
                    className="bg-success text-white hover:bg-success/90 text-xs rounded-xl ml-auto"
                  >
                    Tandai Selesai & Bayar Tunai
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSaveOffer(selectedOffer.status)}
                    disabled={isActionLoading}
                    className="bg-accent-gold text-white hover:bg-accent-gold-hover text-xs rounded-xl ml-auto"
                  >
                    Simpan Catatan
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
