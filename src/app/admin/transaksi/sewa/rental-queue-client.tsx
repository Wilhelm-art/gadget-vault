"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, X, Camera, Eye, Info, Clock, AlertCircle, 
  User, Smartphone, DollarSign, Calendar
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

interface RentalQueueClientProps {
  initialRentals: any[];
}

export default function RentalQueueClient({ initialRentals }: RentalQueueClientProps) {
  const router = useRouter();
  const [rentals, setRentals] = useState(initialRentals);
  
  // Modal states
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoType, setPhotoType] = useState<"pickup" | "return">("pickup");
  
  // Form states
  const [adminNotes, setAdminNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const formatRupiah = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const handleOpenDetail = (rental: any) => {
    setSelectedRental(rental);
    setAdminNotes(rental.adminNotes || "");
    setIsDetailOpen(true);
  };

  const handleOpenPhotoUpload = (rental: any, type: "pickup" | "return") => {
    setSelectedRental(rental);
    setPhotoType(type);
    setPhotoFile(null);
    setPhotoPreview("");
    setIsPhotoModalOpen(true);
  };

  // Status transition handler (non-photo ones)
  const handleUpdateStatus = async (rentalId: string, status: string, notes?: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/rentals/${rentalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Status sewa berhasil diubah ke ${status.toUpperCase()}.`);
        setIsDetailOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Gagal memperbarui status sewa.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Status transition with photo upload handler
  const handleUpdateStatusWithPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile || !selectedRental) {
      toast.error("Mohon pilih foto dokumentasi.");
      return;
    }

    setIsActionLoading(true);
    try {
      // 1. Upload the photo first to the rentals folder
      const uploadData = new FormData();
      uploadData.append("file", photoFile);
      uploadData.append("folder", "rentals");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah foto verifikasi.");
      }

      const uploadResult = await uploadRes.json();
      const photoUrl = uploadResult.imageUrl;
      const photoPath = uploadResult.storagePath;

      // 2. Patch the rental status with the photo details
      const payload: any = {
        status: photoType === "pickup" ? "picked_up" : "returned",
      };

      if (photoType === "pickup") {
        payload.pickupPhotoUrl = photoUrl;
        payload.pickupPhotoStoragePath = photoPath;
      } else {
        payload.returnPhotoUrl = photoUrl;
        payload.returnPhotoStoragePath = photoPath;
      }

      const patchRes = await fetch(`/api/rentals/${selectedRental.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const patchResult = await patchRes.json();

      if (patchRes.ok) {
        toast.success(`Status sewa berhasil diperbarui.`);
        setIsPhotoModalOpen(false);
        router.refresh();
      } else {
        toast.error(patchResult.message || "Gagal memperbarui status sewa.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-bg-tertiary text-text-secondary border border-border">Pending</Badge>;
      case "approved":
        return <Badge className="bg-info text-white">Disetujui</Badge>;
      case "picked_up":
        return <Badge className="bg-warning text-white">Disewa</Badge>;
      case "returned":
        return <Badge className="bg-success text-white">Dikembalikan</Badge>;
      case "completed":
        return <Badge className="bg-success text-white">Selesai</Badge>;
      case "cancelled":
        return <Badge className="bg-danger text-white">Batal</Badge>;
      case "rejected":
        return <Badge className="bg-danger text-white">Ditolak</Badge>;
      default:
        return <Badge className="bg-text-muted text-white">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Rentals Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60">
          <h3 className="font-bold text-text-primary text-sm">Antrian Sewa Masuk</h3>
          <p className="text-[11px] text-text-secondary">Kelola status serah-terima dan pengembalian unit sewa</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-xs text-left">
            <thead className="bg-bg-secondary text-text-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Kode</th>
                <th className="px-5 py-3">Pelanggan</th>
                <th className="px-5 py-3">Produk</th>
                <th className="px-5 py-3">Tanggal Sewa</th>
                <th className="px-5 py-3 text-right">Biaya + Jaminan</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-text-primary">
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">
                    Belum ada pengajuan sewa masuk.
                  </td>
                </tr>
              ) : (
                rentals.map((r: any) => {
                  const isDepositNeeded = Number(r.depositAmount) > 0;
                  const hasProof = !!r.deposit?.transferProofUrl;

                  return (
                    <tr key={r.id} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-accent-gold-hover text-[10px]">
                        {r.transactionCode}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold">{r.user.name}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{r.user.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium max-w-[150px] truncate">{r.product.name}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{r.product.brand}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {new Date(r.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} -{" "}
                          {new Date(r.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{r.durationDays} hari</div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="font-semibold">{formatRupiah(r.totalAmount)}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5 flex items-center justify-end gap-1">
                          {isDepositNeeded ? (
                            <>
                              <span>Jam: {formatRupiah(r.depositAmount)}</span>
                              <Badge className={`text-[8px] py-0 px-1 ${hasProof ? "bg-success text-white" : "bg-danger text-white animate-pulse"}`}>
                                {hasProof ? "Lunas" : "Belum"}
                              </Badge>
                            </>
                          ) : (
                            <span className="text-[9px] text-success">Bebas Deposit</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleOpenDetail(r)}
                            className="p-1 h-7 rounded-lg hover:bg-bg-secondary border border-border"
                          >
                            <Eye className="w-3.5 h-3.5 text-text-secondary" />
                          </Button>
                          
                          {/* Quick Transitions */}
                          {r.status === "pending" && (
                            <>
                              <Button
                                onClick={() => handleUpdateStatus(r.id, "approved")}
                                className="bg-success hover:bg-success/90 text-white text-[10px] h-7 px-2.5 rounded-lg font-bold shadow-sm"
                              >
                                Setujui
                              </Button>
                            </>
                          )}

                          {r.status === "approved" && (
                            <Button
                              onClick={() => handleOpenPhotoUpload(r, "pickup")}
                              className="bg-warning hover:bg-warning/90 text-white text-[10px] h-7 px-2.5 rounded-lg font-bold shadow-sm flex items-center gap-1"
                            >
                              <Camera className="w-3 h-3" /> Ambil Unit
                            </Button>
                          )}

                          {r.status === "picked_up" && (
                            <Button
                              onClick={() => handleOpenPhotoUpload(r, "return")}
                              className="bg-success hover:bg-success/90 text-white text-[10px] h-7 px-2.5 rounded-lg font-bold shadow-sm flex items-center gap-1"
                            >
                              <Camera className="w-3 h-3" /> Kembali Unit
                            </Button>
                          )}

                          {r.status === "returned" && (
                            <Button
                              onClick={() => handleUpdateStatus(r.id, "completed")}
                              className="bg-accent-gold hover:bg-accent-gold-hover text-white text-[10px] h-7 px-2.5 rounded-lg font-bold shadow-sm"
                            >
                              Selesaikan
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENTAL DETAILS DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white rounded-2xl border border-border p-6 max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-primary">
              Rincian Transaksi Sewa
            </DialogTitle>
            <DialogDescription className="text-[11px] text-text-secondary">
              Detail pemesanan penyewa dan validasi offline
            </DialogDescription>
          </DialogHeader>

          {selectedRental && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-3 bg-bg-secondary p-4 rounded-xl border border-border">
                <div>
                  <span className="text-text-secondary">Kode Transaksi:</span>
                  <p className="font-bold text-accent-gold-hover font-mono mt-0.5">{selectedRental.transactionCode}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Status:</span>
                  <p className="mt-0.5">{getStatusBadge(selectedRental.status)}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Nama Penyewa:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedRental.user.name}</p>
                </div>
                <div>
                  <span className="text-text-secondary">No. HP Penyewa:</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedRental.user.phone || "-"}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Kota Asal (KTP):</span>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedRental.user.city || "-"}, {selectedRental.user.province || "-"}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Verifikasi KYC:</span>
                  <p className="font-semibold text-text-primary mt-0.5 uppercase">{selectedRental.user.kycStatus}</p>
                </div>
              </div>

              <div className="border border-border rounded-xl p-4 bg-white space-y-2">
                <span className="font-bold text-text-primary block">Detail Perangkat & Biaya:</span>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Gadget:</span>
                  <span className="font-semibold text-text-primary">{selectedRental.product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Durasi Sewa:</span>
                  <span className="font-semibold text-text-primary">{selectedRental.durationDays} hari ({new Date(selectedRental.startDate).toLocaleDateString("id-ID")} - {new Date(selectedRental.endDate).toLocaleDateString("id-ID")})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tarif Sewa Harian:</span>
                  <span className="font-semibold text-text-primary">{formatRupiah(selectedRental.dailyRate)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-border/60 pt-2">
                  <span className="text-text-primary">Subtotal Biaya:</span>
                  <span className="text-text-primary">{formatRupiah(selectedRental.totalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-text-primary">Uang Jaminan (Deposit):</span>
                  <span className="text-accent-gold-hover">{Number(selectedRental.depositAmount) > 0 ? formatRupiah(selectedRental.depositAmount) : "Bebas Deposit"}</span>
                </div>
              </div>

              {/* Show deposit payment details if any */}
              {selectedRental.deposit && (
                <div className="border border-border rounded-xl p-4 bg-white space-y-2 text-xs">
                  <span className="font-bold text-text-primary block">Informasi Transfer Jaminan:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-text-secondary">Status Deposit:</span>
                      <p className="font-semibold capitalize text-text-primary">{selectedRental.deposit.status}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Bank Pengirim:</span>
                      <p className="font-semibold text-text-primary">{selectedRental.deposit.bankName || "-"}</p>
                    </div>
                  </div>
                  {selectedRental.deposit.transferProofUrl && (
                    <div className="pt-2">
                      <span className="text-text-secondary block mb-1">Bukti Transfer:</span>
                      <a
                        href={selectedRental.deposit.transferProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-accent-gold hover:underline"
                      >
                        Lihat Bukti Transfer Gambar ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Show pickup/return photos if uploaded */}
              {selectedRental.photos && selectedRental.photos.length > 0 && (
                <div className="border border-border rounded-xl p-4 bg-white space-y-2 text-xs">
                  <span className="font-bold text-text-primary block">Dokumentasi Unit:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRental.photos.map((p: any) => (
                      <div key={p.id} className="space-y-1">
                        <span className="text-[10px] text-text-secondary font-bold uppercase">{p.type === "pickup" ? "Foto Penyerahan" : "Foto Pengembalian"}</span>
                        <a
                          href={p.photoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-square block rounded-lg overflow-hidden border border-border"
                        >
                          <img src={p.photoUrl} alt="dokumentasi" className="w-full h-full object-cover" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes Textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Catatan Admin / Alasan Penolakan</label>
                <textarea
                  placeholder="Tulis catatan di sini..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full rounded-xl border border-border p-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  rows={2}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2 border-t border-border/60 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsDetailOpen(false)}
                  className="text-xs font-semibold"
                >
                  Batal
                </Button>
                {selectedRental.status === "pending" && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedRental.id, "rejected", adminNotes)}
                    disabled={isActionLoading}
                    className="bg-danger text-white hover:bg-danger/90 text-xs rounded-xl"
                  >
                    Tolak Sewa
                  </Button>
                )}
                <Button
                  onClick={() => handleUpdateStatus(selectedRental.id, selectedRental.status, adminNotes)}
                  disabled={isActionLoading}
                  className="bg-accent-gold text-white hover:bg-accent-gold-hover text-xs rounded-xl"
                >
                  Simpan Catatan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PHOTO UPLOAD DIALOG FOR PICKUP / RETURN */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="bg-white rounded-2xl border border-border p-6 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-primary capitalize">
              Dokumentasi Serah Terima ({photoType})
            </DialogTitle>
            <DialogDescription className="text-[11px] text-text-secondary">
              Unggah foto penyewa bersama unit sebagai berkas verifikasi offline wajib.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateStatusWithPhoto} className="space-y-4">
            <div className="space-y-2 mt-2">
              <div className="relative border-2 border-dashed border-border rounded-xl p-5 text-center bg-bg-secondary hover:border-accent-gold transition-colors duration-200 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setPhotoFile(e.target.files[0]);
                      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <Camera className="w-6 h-6 text-accent-gold mx-auto mb-1" />
                <span className="text-[11px] text-text-primary font-semibold block">Pilih Foto Dokumentasi</span>
                <span className="text-[9px] text-text-secondary block">Maksimal 5MB, format gambar</span>
              </div>

              {photoPreview && (
                <div className="relative w-36 h-36 rounded-xl border border-border overflow-hidden bg-bg-secondary mx-auto mt-2">
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(photoPreview);
                      setPhotoFile(null);
                      setPhotoPreview("");
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2 border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isActionLoading}
                className="bg-accent-gold text-white hover:bg-accent-gold-hover text-xs rounded-xl ml-auto"
              >
                {isActionLoading ? "Menyimpan..." : "Simpan & Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
