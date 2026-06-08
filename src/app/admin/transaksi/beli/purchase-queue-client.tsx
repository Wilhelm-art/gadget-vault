"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, X, Eye, Clock, ShoppingBag, 
  User, Smartphone, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface PurchaseQueueClientProps {
  initialPurchases: any[];
}

export default function PurchaseQueueClient({ initialPurchases }: PurchaseQueueClientProps) {
  const router = useRouter();
  const [purchases, setPurchases] = useState(initialPurchases);
  
  // Modal states
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form states
  const [adminNotes, setAdminNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const formatRupiah = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const handleOpenDetail = (purchase: any) => {
    setSelectedPurchase(purchase);
    setAdminNotes(purchase.adminNotes || "");
    setPaymentMethod(purchase.paymentMethod || "cash");
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (purchaseId: string, status: string, notes?: string, payMethod?: string) => {
    setIsActionLoading(true);
    try {
      const payload: any = { status, adminNotes: notes };
      if (payMethod) payload.paymentMethod = payMethod;

      const res = await fetch(`/api/purchases/${purchaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Status pembelian berhasil diubah ke ${status.toUpperCase()}.`);
        setIsDetailOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Gagal memperbarui status pembelian.");
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
        return <Badge className="bg-bg-tertiary text-text-secondary border border-border">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-info text-white">Dikonfirmasi</Badge>;
      case "checked":
        return <Badge className="bg-warning text-white">Cek Fisik</Badge>;
      case "paid":
        return <Badge className="bg-success text-white">Dibayar</Badge>;
      case "completed":
        return <Badge className="bg-success text-white">Selesai</Badge>;
      case "cancelled":
        return <Badge className="bg-danger text-white">Batal</Badge>;
      default:
        return <Badge className="bg-text-muted text-white">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60">
          <h3 className="font-bold text-text-primary text-sm">Antrian Pengajuan Beli</h3>
          <p className="text-[11px] text-text-secondary">Kelola status pesanan pembelian gadget offline pelanggan</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-xs text-left">
            <thead className="bg-bg-secondary text-text-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Kode</th>
                <th className="px-5 py-3">Pelanggan</th>
                <th className="px-5 py-3">Produk</th>
                <th className="px-5 py-3">Tanggal Pengajuan</th>
                <th className="px-5 py-3 text-right">Harga Unit</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-text-primary">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">
                    Belum ada pengajuan pembelian unit.
                  </td>
                </tr>
              ) : (
                purchases.map((p: any) => (
                  <tr key={p.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-accent-gold-hover text-[10px]">
                      {p.transactionCode}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{p.user.name}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{p.user.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium max-w-[150px] truncate">{p.product.name}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{p.product.brand}</div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {formatRupiah(p.amount)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenDetail(p)}
                          className="p-1 h-7 rounded-lg hover:bg-bg-secondary border border-border"
                        >
                          <Eye className="w-3.5 h-3.5 text-text-secondary" />
                        </Button>

                        {/* Quick Transitions */}
                        {p.status === "pending" && (
                          <Button
                            onClick={() => handleUpdateStatus(p.id, "confirmed")}
                            className="bg-success hover:bg-success/90 text-white text-[10px] h-7 px-2.5 rounded-lg font-bold shadow-sm"
                          >
                            Konfirmasi
                          </Button>
                        )}

                        {p.status === "confirmed" && (
                          <Button
                            onClick={() => handleUpdateStatus(p.id, "checked")}
                            className="bg-warning hover:bg-warning/90 text-white text-[10px] h-7 px-2.5 rounded-lg font-bold shadow-sm"
                          >
                            Cek Fisik
                          </Button>
                        )}

                        {p.status === "checked" && (
                          <Button
                            onClick={() => handleOpenDetail(p)} // Open details to choose payment & complete
                            className="bg-success hover:bg-success/90 text-white text-[10px] h-7 px-2.5 rounded-lg font-bold shadow-sm"
                          >
                            Bayar
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

      {/* DETAILS DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white rounded-2xl border border-border p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-primary">
              Rincian Transaksi Pembelian
            </DialogTitle>
            <DialogDescription className="text-[11px] text-text-secondary">
              Kelola status pembayaran dan handover offline.
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-3 bg-bg-secondary p-4 rounded-xl border border-border">
                <div>
                  <span className="text-text-secondary">Kode Transaksi:</span>
                  <p className="font-bold text-accent-gold-hover font-mono mt-0.5">{selectedPurchase.transactionCode}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Status:</span>
                  <p className="mt-0.5">{getStatusBadge(selectedPurchase.status)}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Nama Pembeli:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedPurchase.user.name}</p>
                </div>
                <div>
                  <span className="text-text-secondary">No. HP Pembeli:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedPurchase.user.phone || "-"}</p>
                </div>
              </div>

              <div className="border border-border rounded-xl p-4 bg-white space-y-2">
                <span className="font-bold text-text-primary block">Detail Perangkat & Harga:</span>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Gadget:</span>
                  <span className="font-semibold text-text-primary">{selectedPurchase.product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Merk / Brand:</span>
                  <span className="font-semibold text-text-primary">{selectedPurchase.product.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Model:</span>
                  <span className="font-semibold text-text-primary">{selectedPurchase.product.model}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-border/60 pt-2 text-sm">
                  <span className="text-text-primary">Total Harga Beli:</span>
                  <span className="text-text-primary">{formatRupiah(selectedPurchase.amount)}</span>
                </div>
              </div>

              {/* Status and Action flow buttons inside Modal */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-text-primary">Update Status Progres:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPurchase.status === "pending" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedPurchase.id, "confirmed", adminNotes)}
                      disabled={isActionLoading}
                      className="bg-info text-white hover:bg-info/90 text-[10px] h-8 rounded-lg"
                    >
                      Konfirmasi Pesanan
                    </Button>
                  )}
                  {selectedPurchase.status === "confirmed" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedPurchase.id, "checked", adminNotes)}
                      disabled={isActionLoading}
                      className="bg-warning text-white hover:bg-warning/90 text-[10px] h-8 rounded-lg"
                    >
                      Mulai Cek Fisik
                    </Button>
                  )}
                  {selectedPurchase.status === "checked" && (
                    <div className="w-full space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Metode Pembayaran Kasir</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold"
                        >
                          <option value="cash">Tunai / Cash</option>
                          <option value="debit">Debit Card</option>
                          <option value="transfer">Bank Transfer (Offline)</option>
                        </select>
                      </div>
                      <Button
                        onClick={() => handleUpdateStatus(selectedPurchase.id, "paid", adminNotes, paymentMethod)}
                        disabled={isActionLoading}
                        className="bg-success text-white hover:bg-success/90 text-[10px] h-8 w-full rounded-lg"
                      >
                        Tandai Sudah Bayar
                      </Button>
                    </div>
                  )}
                  {selectedPurchase.status === "paid" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedPurchase.id, "completed", adminNotes)}
                      disabled={isActionLoading}
                      className="bg-accent-gold text-white hover:bg-accent-gold-hover text-[10px] h-8 w-full rounded-lg"
                    >
                      Selesaikan & Serahkan Unit
                    </Button>
                  )}
                </div>
              </div>

              {/* Admin Notes Textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Catatan Admin</label>
                <textarea
                  placeholder="Tulis catatan admin atau alasan pembatalan..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full rounded-xl border border-border p-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  rows={2}
                />
              </div>

              <DialogFooter className="flex justify-between gap-2 border-t border-border/60 pt-4">
                {selectedPurchase.status !== "completed" && selectedPurchase.status !== "cancelled" && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedPurchase.id, "cancelled", adminNotes)}
                    disabled={isActionLoading}
                    className="bg-danger text-white hover:bg-danger/90 text-xs rounded-xl"
                  >
                    Batalkan Transaksi
                  </Button>
                )}
                <Button
                  onClick={() => handleUpdateStatus(selectedPurchase.id, selectedPurchase.status, adminNotes)}
                  disabled={isActionLoading}
                  className="bg-accent-gold text-white hover:bg-accent-gold-hover text-xs rounded-xl ml-auto"
                >
                  Simpan Catatan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
