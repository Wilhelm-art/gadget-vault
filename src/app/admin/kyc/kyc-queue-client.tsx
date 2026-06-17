"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Check, X, Eye, ShieldCheck, AlertCircle, 
  User, Calendar, Info, ShieldAlert
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

interface KycQueueClientProps {
  initialDocs: any[];
}

export default function KycQueueClient({ initialDocs }: KycQueueClientProps) {
  const router = useRouter();
  const [docs, setDocs] = useState(initialDocs);

  // Modal states
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form states
  const [rejectionReason, setRejectionReason] = useState("");

  const handleOpenDetail = (doc: any) => {
    setSelectedDoc(doc);
    setRejectionReason(doc.rejectionReason || "");
    setIsDetailOpen(true);
  };

  const handleVerifyKyc = async (status: "approved" | "rejected") => {
    if (status === "rejected" && !rejectionReason.trim()) {
      toast.error("Mohon tuliskan alasan penolakan berkas.");
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/kyc/${selectedDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Verifikasi KYC berhasil diubah ke ${status.toUpperCase()}.`);
        setIsDetailOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Gagal memperbarui status KYC.");
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
      case "approved":
        return <Badge className="bg-success text-white">Disetujui</Badge>;
      case "rejected":
        return <Badge className="bg-danger text-white">Ditolak</Badge>;
      default:
        return <Badge className="bg-text-muted text-white">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60">
          <h3 className="font-bold text-text-primary text-sm">Antrian Verifikasi KYC</h3>
          <p className="text-[11px] text-text-secondary">Tinjau kesesuaian data diri dengan foto KTP dan selfie pelanggan</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-xs text-left">
            <thead className="bg-bg-secondary text-text-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Pelanggan</th>
                <th className="px-5 py-3">Nomor KTP</th>
                <th className="px-5 py-3">Kota / Provinsi</th>
                <th className="px-5 py-3">Tanggal Submit</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-text-primary">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-secondary">
                    Belum ada pengajuan verifikasi KYC pending.
                  </td>
                </tr>
              ) : (
                docs.map((d: any) => (
                  <tr key={d.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold">{d.user.name}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{d.user.email}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium">
                      {d.ktpNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{d.user.city || "-"}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{d.user.province || "-"}</div>
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
                        
                        {d.status === "pending" && (
                          <Button
                            onClick={() => handleOpenDetail(d)}
                            className="bg-accent-gold hover:bg-accent-gold-hover text-white text-[10px] h-7 px-2.5 rounded-lg font-bold"
                          >
                            Tinjau Berkas
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

      {/* DETAIL VIEW / SIDE-BY-SIDE INSPECTION DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white rounded-2xl border border-border p-6 max-w-lg sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-accent-gold" /> Tinjau Berkas Identitas KYC
            </DialogTitle>
            <DialogDescription className="text-[11px] text-text-secondary">
              Periksa kesesuaian nomor KTP, kesamaan wajah di KTP vs Selfie.
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-5 text-xs leading-relaxed mt-2">
              <div className="grid grid-cols-2 gap-4 bg-bg-secondary p-4 rounded-xl border border-border">
                <div>
                  <span className="text-text-secondary">Nama Pelanggan:</span>
                  <p className="font-bold text-text-primary mt-0.5">{selectedDoc.user.name}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Nomor KTP:</span>
                  <p className="font-mono font-bold text-text-primary mt-0.5">{selectedDoc.ktpNumber}</p>
                </div>
                <div>
                  <span className="text-text-secondary">No. HP Pelanggan:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedDoc.user.phone || "-"}</p>
                </div>
                <div>
                  <span className="text-text-secondary">No. HP Orang Tua:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedDoc.parentPhone || "-"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-text-secondary">Kota & Provinsi:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedDoc.user.city || "-"}, {selectedDoc.user.province || "-"}</p>
                </div>
              </div>

              {/* Photos Comparison Panel */}
              <div className="space-y-3">
                <span className="font-bold text-text-primary block">Dokumen Foto KYC:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase block">KTP Depan</span>
                    <a
                      href={selectedDoc.signedKtpFront}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-[4/3] block rounded-xl overflow-hidden border border-border bg-bg-secondary hover:opacity-95"
                    >
                      <div className="relative w-full h-full">
                        <Image 
                          src={selectedDoc.signedKtpFront} 
                          alt="KTP Depan" 
                          fill 
                          sizes="200px" 
                          className="object-cover" 
                        />
                      </div>
                    </a>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase block">KTP Belakang</span>
                    <a
                      href={selectedDoc.signedKtpBack}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-[4/3] block rounded-xl overflow-hidden border border-border bg-bg-secondary hover:opacity-95"
                    >
                      <div className="relative w-full h-full">
                        <Image 
                          src={selectedDoc.signedKtpBack} 
                          alt="KTP Belakang" 
                          fill 
                          sizes="200px" 
                          className="object-cover" 
                        />
                      </div>
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase block">Selfie + KTP</span>
                    <a
                      href={selectedDoc.signedSelfieKtp}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-[4/3] block rounded-xl overflow-hidden border border-border bg-bg-secondary hover:opacity-95"
                    >
                      <div className="relative w-full h-full">
                        <Image 
                          src={selectedDoc.signedSelfieKtp} 
                          alt="Selfie" 
                          fill 
                          sizes="200px" 
                          className="object-cover" 
                        />
                      </div>
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase block">Kartu Keluarga</span>
                    {selectedDoc.signedKk ? (
                      <a
                        href={selectedDoc.signedKk}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-[4/3] block rounded-xl overflow-hidden border border-border bg-bg-secondary hover:opacity-95"
                      >
                        <div className="relative w-full h-full">
                          <Image 
                            src={selectedDoc.signedKk} 
                            alt="Kartu Keluarga" 
                            fill 
                            sizes="200px" 
                            className="object-cover" 
                          />
                        </div>
                      </a>
                    ) : (
                      <div className="aspect-[4/3] flex items-center justify-center rounded-xl border border-border bg-bg-secondary text-text-muted text-[10px]">
                        Tidak ada KK
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Input (Only if pending or rejected) */}
              {selectedDoc.status === "pending" && (
                <div className="space-y-1.5 border-t border-border/60 pt-3">
                  <label className="text-[10px] font-bold text-text-secondary uppercase block">Alasan Penolakan (Hanya diisi jika berkas ditolak)</label>
                  <textarea
                    placeholder="Contoh: Foto selfie blur / data KTP terpotong / nomor KTP tidak sesuai..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded-xl border border-border p-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold"
                    rows={2}
                  />
                </div>
              )}

              {selectedDoc.status === "rejected" && selectedDoc.rejectionReason && (
                <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Alasan Penolakan Sebelumnya:</span>
                    <p className="mt-0.5">{selectedDoc.rejectionReason}</p>
                  </div>
                </div>
              )}

              <DialogFooter className="flex justify-end gap-2 border-t border-border/60 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDetailOpen(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                {selectedDoc.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleVerifyKyc("rejected")}
                      disabled={isActionLoading}
                      className="bg-danger text-white hover:bg-danger/90 text-xs rounded-xl"
                    >
                      Tolak Berkas
                    </Button>
                    <Button
                      onClick={() => handleVerifyKyc("approved")}
                      disabled={isActionLoading}
                      className="bg-success text-white hover:bg-success/90 text-xs rounded-xl"
                    >
                      Setujui KYC
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
