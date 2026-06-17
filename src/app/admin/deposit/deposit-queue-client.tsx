"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Check, X, Eye, CircleDollarSign, 
  User, Calendar, CreditCard, ShieldCheck
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

interface DepositQueueClientProps {
  initialDeposits: any[];
}

export default function DepositQueueClient({ initialDeposits }: DepositQueueClientProps) {
  const router = useRouter();
  const [deposits, setDeposits] = useState(initialDeposits);

  // Modal states
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const formatRupiah = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const handleOpenDetail = (dep: any) => {
    setSelectedDeposit(dep);
    setIsDetailOpen(true);
  };

  const handleVerifyDeposit = async (status: "verified" | "refunded" | "forfeited") => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/deposits/${selectedDeposit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Deposit berhasil diubah ke status ${status.toUpperCase()}.`);
        setIsDetailOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Gagal memperbarui status deposit.");
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
      case "verified":
        return <Badge className="bg-success text-white">Terverifikasi</Badge>;
      case "refunded":
        return <Badge className="bg-info text-white">Refunded</Badge>;
      case "forfeited":
        return <Badge className="bg-danger text-white">Hangus</Badge>;
      default:
        return <Badge className="bg-text-muted text-white">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60">
          <h3 className="font-bold text-text-primary text-sm">Manajemen Deposit Jaminan</h3>
          <p className="text-[11px] text-text-secondary">Verifikasi pembayaran jaminan sewa luar kota dan kelola refund</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-xs text-left">
            <thead className="bg-bg-secondary text-text-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Penyewa</th>
                <th className="px-5 py-3">Kode Sewa</th>
                <th className="px-5 py-3 text-right">Nominal Jaminan</th>
                <th className="px-5 py-3">Bank Pengirim</th>
                <th className="px-5 py-3">Tanggal Unggah</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-text-primary">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">
                    Belum ada pengajuan deposit jaminan masuk.
                  </td>
                </tr>
              ) : (
                deposits.map((d: any) => (
                  <tr key={d.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold">{d.user.name}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{d.user.email}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium">
                      {d.rental.transactionCode}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {formatRupiah(d.amount)}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {d.bankName || "-"}
                      <div className="text-[10px] text-text-secondary font-mono font-normal mt-0.5">{d.accountNumber || ""}</div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {new Date(d.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenDetail(d)}
                          className="p-1 h-7 rounded-lg hover:bg-bg-secondary border border-border"
                        >
                          <Eye className="w-3.5 h-3.5 text-text-secondary" />
                        </Button>
                        
                        {d.status === "pending" && d.transferProofUrl && (
                          <Button
                            onClick={() => handleOpenDetail(d)}
                            className="bg-accent-gold hover:bg-accent-gold-hover text-white text-[10px] h-7 px-2.5 rounded-lg font-bold"
                          >
                            Verifikasi
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
        <DialogContent className="bg-white rounded-2xl border border-border p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-accent-gold" /> Detail Jaminan (Deposit)
            </DialogTitle>
            <DialogDescription className="text-[11px] text-text-secondary">
              Review bukti transfer deposit jaminan dan setujui statusnya.
            </DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-3 bg-bg-secondary p-4 rounded-xl border border-border">
                <div>
                  <span className="text-text-secondary">Pelanggan:</span>
                  <p className="font-bold text-text-primary mt-0.5">{selectedDeposit.user.name}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Kode Transaksi Sewa:</span>
                  <p className="font-mono font-bold text-text-primary mt-0.5">{selectedDeposit.rental.transactionCode}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Nominal Jaminan:</span>
                  <p className="font-bold text-accent-gold-hover mt-0.5">{formatRupiah(selectedDeposit.amount)}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Status:</span>
                  <p className="mt-0.5">{getStatusBadge(selectedDeposit.status)}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Bank Pengirim:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedDeposit.bankName || "-"}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Rekening Refund:</span>
                  <p className="font-mono font-semibold text-text-primary mt-0.5">{selectedDeposit.accountNumber || "-"}</p>
                </div>
              </div>

              {/* Transfer Proof Image */}
              {selectedDeposit.signedProofUrl ? (
                <div className="space-y-1.5">
                  <span className="font-bold text-text-primary block">Bukti Transfer:</span>
                  <a
                    href={selectedDeposit.signedProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-[3/4] rounded-xl border border-border overflow-hidden bg-bg-secondary hover:opacity-95"
                  >
                    <div className="relative w-full h-full">
                      <Image 
                        src={selectedDeposit.signedProofUrl} 
                        alt="Transfer Proof" 
                        fill 
                        sizes="(max-width: 640px) 100vw, 400px" 
                        className="object-cover" 
                      />
                    </div>
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-danger/10 text-danger rounded-xl text-center font-bold">
                  Belum mengunggah bukti transfer
                </div>
              )}

              {/* Status Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                {selectedDeposit.status === "pending" && selectedDeposit.transferProofUrl && (
                  <>
                    <Button
                      onClick={() => handleVerifyDeposit("verified")}
                      disabled={isActionLoading}
                      className="bg-success text-white hover:bg-success/90 text-xs rounded-xl flex-1"
                    >
                      Verifikasi Terbayar
                    </Button>
                  </>
                )}
                {selectedDeposit.status === "verified" && (
                  <>
                    <Button
                      onClick={() => handleVerifyDeposit("refunded")}
                      disabled={isActionLoading}
                      className="bg-info text-white hover:bg-info/90 text-xs rounded-xl flex-1"
                    >
                      Tandai Sudah Direfund
                    </Button>
                    <Button
                      onClick={() => handleVerifyDeposit("forfeited")}
                      disabled={isActionLoading}
                      className="bg-danger text-white hover:bg-danger/90 text-xs rounded-xl flex-1"
                    >
                      Hanguskan Jaminan
                    </Button>
                  </>
                )}
              </div>

              <DialogFooter className="flex justify-end gap-2 border-t border-border/60 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDetailOpen(false)}
                  className="text-xs"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
