"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Calendar, ShoppingBag, Coins, Upload, Info, Check, 
  MapPin, Clock, ShieldCheck, CreditCard, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TransactionDetailClientProps {
  id: string;
  type: "sewa" | "beli" | "jual";
  transaction: any;
  storeSettings: any;
}

export default function TransactionDetailClient({
  id,
  type,
  transaction,
  storeSettings,
}: TransactionDetailClientProps) {
  const router = useRouter();
  
  // Deposit upload states
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Sell offer response states
  const [isUpdatingOffer, setIsUpdatingOffer] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file bukti transfer maksimal 5MB.");
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
  };

  // Upload deposit handler
  const handleUploadDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !bankName || !accountNumber) {
      toast.error("Mohon lengkapi seluruh field.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("rentalId", transaction.id);
      formData.append("bankName", bankName);
      formData.append("accountNumber", accountNumber);
      formData.append("file", file);

      const res = await fetch("/api/deposits", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Bukti transfer jaminan berhasil diunggah.");
        router.refresh();
        removeFile();
      } else {
        toast.error(data.message || "Gagal mengunggah bukti transfer.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsUploading(false);
    }
  };

  // Accept/reject sell offer handler
  const handleRespondOffer = async (responseStatus: "accepted" | "rejected") => {
    setIsUpdatingOffer(true);
    try {
      const res = await fetch(`/api/sell-offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: responseStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        if (responseStatus === "accepted") {
          toast.success("Anda menyetujui taksiran harga. Silakan datang ke toko.");
        } else {
          toast.success("Anda menolak taksiran harga dari toko.");
        }
        router.refresh();
      } else {
        toast.error(data.message || "Gagal memperbarui status penawaran.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsUpdatingOffer(false);
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

  // -------------------------
  // TIMELINE LOGIC
  // -------------------------
  const renderSewaTimeline = () => {
    const status = transaction.status;
    const isDepositNeeded = Number(transaction.depositAmount) > 0;
    const depositStatus = transaction.deposit?.status;
    const hasUploadedProof = !!transaction.deposit?.transferProofUrl;

    const steps = [
      { key: "pending", label: "Diajukan", desc: "Menunggu verifikasi admin" },
      ...(isDepositNeeded 
        ? [{ 
            key: "deposit", 
            label: "Jaminan Sewa", 
            desc: !hasUploadedProof 
              ? "Wajib Transfer Deposit" 
              : depositStatus === "pending" 
              ? "Deposit Menunggu Verifikasi" 
              : depositStatus === "verified"
              ? "Deposit Terverifikasi"
              : "Deposit Refunded"
          }]
        : []
      ),
      { key: "approved", label: "Disetujui", desc: "Siap diambil di toko" },
      { key: "picked_up", label: "Sedang Disewa", desc: "Barang ada di tangan Anda" },
      { key: "returned", label: "Dikembalikan", desc: "Pengecekan fisik di toko" },
      { key: "completed", label: "Selesai", desc: "Sewa selesai & deposit direfund" }
    ];

    // Determine active index
    let activeIndex = 0;
    if (status === "cancelled" || status === "rejected") {
      return (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger font-semibold">
          Transaksi ini telah {status === "cancelled" ? "Dibatalkan" : "Ditolak oleh Admin"}.
        </div>
      );
    }

    if (status === "pending") activeIndex = 0;
    else if (isDepositNeeded && !hasUploadedProof) activeIndex = 1;
    else if (isDepositNeeded && depositStatus === "pending") activeIndex = 1;
    else if (status === "approved") activeIndex = isDepositNeeded ? 2 : 1;
    else if (status === "picked_up") activeIndex = isDepositNeeded ? 3 : 2;
    else if (status === "returned") activeIndex = isDepositNeeded ? 4 : 3;
    else if (status === "completed") activeIndex = isDepositNeeded ? 5 : 4;

    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Progress Transaksi</h4>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={idx} className="relative flex gap-4 text-xs">
                <div className={`absolute -left-6 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  isCompleted 
                    ? "bg-accent-gold border-accent-gold text-white" 
                    : isActive 
                    ? "bg-white border-accent-gold text-accent-gold" 
                    : "bg-white border-border text-text-muted"
                }`}>
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                </div>
                <div>
                  <h5 className={`font-bold ${isActive ? "text-accent-gold-hover" : isCompleted ? "text-text-primary" : "text-text-secondary"}`}>
                    {step.label}
                  </h5>
                  <p className="text-[10px] text-text-secondary mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBeliTimeline = () => {
    const status = transaction.status;
    const steps = [
      { key: "pending", label: "Diajukan", desc: "Menunggu verifikasi admin" },
      { key: "confirmed", label: "Dikonfirmasi", desc: "Pemesanan disetujui toko" },
      { key: "checked", label: "Pengecekan Fisik", desc: "Cek perangkat offline di toko" },
      { key: "paid", label: "Pembayaran", desc: "Bayar offline (Cash/Debit)" },
      { key: "completed", label: "Selesai", desc: "Unit diserahterimakan" }
    ];

    if (status === "cancelled") {
      return (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger font-semibold">
          Transaksi ini telah Dibatalkan.
        </div>
      );
    }

    let activeIndex = 0;
    if (status === "pending") activeIndex = 0;
    else if (status === "confirmed") activeIndex = 1;
    else if (status === "checked") activeIndex = 2;
    else if (status === "paid") activeIndex = 3;
    else if (status === "completed") activeIndex = 4;

    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Progress Pembelian</h4>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={idx} className="relative flex gap-4 text-xs">
                <div className={`absolute -left-6 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  isCompleted 
                    ? "bg-accent-gold border-accent-gold text-white" 
                    : isActive 
                    ? "bg-white border-accent-gold text-accent-gold" 
                    : "bg-white border-border text-text-muted"
                }`}>
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                </div>
                <div>
                  <h5 className={`font-bold ${isActive ? "text-accent-gold-hover" : isCompleted ? "text-text-primary" : "text-text-secondary"}`}>
                    {step.label}
                  </h5>
                  <p className="text-[10px] text-text-secondary mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderJualTimeline = () => {
    const status = transaction.status;
    const steps = [
      { key: "pending", label: "Diajukan", desc: "Menunggu tinjauan awal admin" },
      { key: "reviewed", label: "Selesai Ditinjau", desc: "Taksiran sedang dirumuskan" },
      { key: "offered", label: "Harga Ditawarkan", desc: "Harga taksiran siap Anda respon" },
      { key: "accepted", label: "Disetujui Pelanggan", desc: "Bawa gadget fisik Anda ke toko" },
      { key: "completed", label: "Selesai", desc: "Dana dicairkan offline" }
    ];

    if (status === "rejected") {
      return (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger font-semibold">
          Transaksi penawaran jual ini Ditolak / Dibatalkan.
        </div>
      );
    }

    let activeIndex = 0;
    if (status === "pending") activeIndex = 0;
    else if (status === "reviewed") activeIndex = 1;
    else if (status === "offered") activeIndex = 2;
    else if (status === "accepted") activeIndex = 3;
    else if (status === "completed") activeIndex = 4;

    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Progress Penawaran Jual</h4>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={idx} className="relative flex gap-4 text-xs">
                <div className={`absolute -left-6 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  isCompleted 
                    ? "bg-accent-gold border-accent-gold text-white" 
                    : isActive 
                    ? "bg-white border-accent-gold text-accent-gold" 
                    : "bg-white border-border text-text-muted"
                }`}>
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                </div>
                <div>
                  <h5 className={`font-bold ${isActive ? "text-accent-gold-hover" : isCompleted ? "text-text-primary" : "text-text-secondary"}`}>
                    {step.label}
                  </h5>
                  <p className="text-[10px] text-text-secondary mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* COLUMN 1 & 2: Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Transaction Header Info Card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold text-accent-gold tracking-wide uppercase">
                {type === "jual" ? `ID: ${transaction.id.slice(0, 8)}...` : transaction.transactionCode}
              </span>
              <h2 className="text-lg font-bold text-text-primary mt-1">
                {type === "jual" ? transaction.itemName : transaction.product.name}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Diajukan pada: {new Date(transaction.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="text-right">
              {type === "sewa" && (
                <Badge className="bg-accent-gold text-white font-semibold">SEWA GADGET</Badge>
              )}
              {type === "beli" && (
                <Badge className="bg-info text-white font-semibold">BELI GADGET</Badge>
              )}
              {type === "jual" && (
                <Badge className="bg-accent-gold-light text-accent-gold-hover font-bold">JUAL GADGET</Badge>
              )}
            </div>
          </div>

          {/* Details Table */}
          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4 text-xs leading-relaxed">
            {type === "sewa" && (
              <>
                <div>
                  <span className="text-text-secondary">Durasi Sewa:</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {transaction.durationDays} hari ({new Date(transaction.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {new Date(transaction.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })})
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Tarif Harian:</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {formatRupiah(transaction.dailyRate)} / hari
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Subtotal Sewa:</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {formatRupiah(transaction.totalAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Uang Jaminan (Deposit):</span>
                  <p className="font-bold text-text-primary mt-0.5">
                    {Number(transaction.depositAmount) > 0 ? formatRupiah(transaction.depositAmount) : "Bebas Deposit (Dalam Kota)"}
                  </p>
                </div>
              </>
            )}

            {type === "beli" && (
              <>
                <div>
                  <span className="text-text-secondary">Merk / Model:</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {transaction.product.brand} · {transaction.product.model}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Metode Transaksi:</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    COD Toko Offline (Pick up & Pay)
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Nominal Pembayaran:</span>
                  <p className="font-bold text-text-primary text-sm mt-0.5">
                    {formatRupiah(transaction.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Status Pemesanan:</span>
                  <p className="font-semibold text-text-primary mt-0.5 capitalize">
                    {transaction.status}
                  </p>
                </div>
              </>
            )}

            {type === "jual" && (
              <>
                <div>
                  <span className="text-text-secondary">Kondisi Fisik:</span>
                  <p className="font-semibold text-text-primary mt-0.5 capitalize">
                    {transaction.condition === "like_new" ? "Mulus Like New" : transaction.condition === "good" ? "Bagus (Good)" : transaction.condition === "fair" ? "Normal (Fair)" : "Kurang (Poor)"}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Aksesoris / Kelengkapan:</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {transaction.completeness}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Harga yang Diharapkan:</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {transaction.askingPrice ? formatRupiah(transaction.askingPrice) : "Tidak ditentukan"}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Taksiran Penawaran Toko:</span>
                  <p className="font-bold text-accent-gold mt-0.5">
                    {transaction.offeredPrice ? formatRupiah(transaction.offeredPrice) : "Menunggu peninjauan admin"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Description display for Jual */}
          {type === "jual" && (
            <div className="bg-bg-secondary p-4 rounded-xl text-xs border border-border mt-2 space-y-1">
              <span className="font-semibold text-text-primary">Deskripsi Detail & Minus:</span>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line text-[11px]">
                {transaction.description}
              </p>
            </div>
          )}

          {/* Show admin notes if available */}
          {transaction.adminNotes && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 mt-2 space-y-1">
              <span className="font-bold">Catatan Admin:</span>
              <p className="leading-relaxed">{transaction.adminNotes}</p>
            </div>
          )}
        </div>

        {/* PHOTO GALLERIES (For Sell Offers) */}
        {type === "jual" && transaction.images.length > 0 && (
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Galeri Foto Perangkat Anda</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {transaction.images.map((img: any) => (
                <a
                  key={img.id}
                  href={img.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="relative aspect-square rounded-xl border border-border bg-bg-secondary overflow-hidden block hover:opacity-90 transition-opacity"
                >
                  <Image src={img.imageUrl} alt="Offer Item" fill sizes="80px" className="object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* SELL OFFER DECISION MODULE */}
        {type === "jual" && transaction.status === "offered" && (
          <div className="bg-white border border-accent-gold rounded-2xl p-6 shadow-sm space-y-4 animate-pulse-subtle">
            <div className="flex gap-3 items-start">
              <Info className="h-5 w-5 text-accent-gold shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">Admin Telah Memberikan Taksiran Harga!</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Toko kami bersedia membeli perangkat Anda dengan harga penawaran sebesar{" "}
                  <strong className="text-text-primary">{formatRupiah(transaction.offeredPrice)}</strong>. 
                  Silakan konfirmasi respon Anda di bawah. Jika setuju, silakan bawa unit ke toko offline kami di Cimahi untuk validasi fisik dan pencairan dana langsung.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
              <Button
                variant="ghost"
                onClick={() => handleRespondOffer("rejected")}
                disabled={isUpdatingOffer}
                className="text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-xl px-5"
              >
                Tolak Penawaran
              </Button>
              <Button
                onClick={() => handleRespondOffer("accepted")}
                disabled={isUpdatingOffer}
                className="bg-accent-gold text-white hover:bg-accent-gold-hover rounded-xl px-6"
              >
                {isUpdatingOffer ? "Memproses..." : "Terima Penawaran"}
              </Button>
            </div>
          </div>
        )}

        {/* DEPOSIT UPLOAD MODULE (For out of town Sewa) */}
        {type === "sewa" && Number(transaction.depositAmount) > 0 && (
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-accent-gold" /> Informasi Jaminan (Deposit) Luar Kota
            </h3>

            {/* If not uploaded proof yet */}
            {!transaction.deposit?.transferProofUrl ? (
              <div className="space-y-4">
                <div className="p-4 bg-accent-gold-light/40 border border-accent-gold-light rounded-xl text-xs leading-relaxed space-y-2">
                  <p className="font-semibold text-text-primary">💵 Kewajiban Transfer Jaminan:</p>
                  <p className="text-text-secondary">
                    Karena alamat KTP Anda berada di luar kota Bandung/Cimahi, Anda wajib melakukan transfer uang jaminan (deposit) sebesar:
                  </p>
                  <p className="text-lg font-bold text-accent-gold-hover">
                    {formatRupiah(transaction.depositAmount)}
                  </p>
                  <p className="text-text-secondary text-[11px] pt-1">
                    Jaminan ini akan dikembalikan (refund) 100% setelah masa sewa berakhir dan perangkat dikembalikan dalam kondisi aman dan utuh.
                  </p>
                </div>

                {/* Bank account details */}
                <div className="bg-bg-secondary p-4 rounded-xl border border-border text-xs space-y-1.5">
                  <span className="font-semibold text-text-primary block mb-1">Kirim Ke Rekening Toko:</span>
                  <div className="grid grid-cols-3">
                    <span className="text-text-secondary">Bank:</span>
                    <span className="col-span-2 font-bold text-text-primary">{storeSettings.bankName}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-text-secondary">Nomor Rekening:</span>
                    <span className="col-span-2 font-mono font-bold text-text-primary">{storeSettings.bankAccountNumber}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-text-secondary">Atas Nama:</span>
                    <span className="col-span-2 font-bold text-text-primary">{storeSettings.bankAccountName}</span>
                  </div>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleUploadDeposit} className="space-y-4 border-t border-border pt-4">
                  <h4 className="text-xs font-bold text-text-primary">Unggah Bukti Transfer Deposit</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-text-secondary uppercase">Nama Bank Pengirim Anda</label>
                      <Input
                        placeholder="Contoh: BCA, Mandiri"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="rounded-xl border-border text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-text-secondary uppercase">Nomor Rekening Anda (Untuk Refund)</label>
                      <Input
                        placeholder="Contoh: 1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="rounded-xl border-border text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-text-secondary uppercase block">Foto Bukti Transfer *</label>
                    <div className="relative border-2 border-dashed border-border rounded-xl p-4 text-center bg-bg-secondary hover:border-accent-gold transition-colors duration-200 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required={!previewUrl}
                      />
                      <Upload className="w-6 h-6 text-accent-gold mx-auto mb-1" />
                      <span className="text-[11px] text-text-primary font-semibold block">Pilih Foto Bukti Transfer</span>
                      <span className="text-[9px] text-text-secondary block">Maksimal 5MB, format gambar</span>
                    </div>

                    {/* Preview Image */}
                    {previewUrl && (
                      <div className="relative w-32 h-32 rounded-xl border border-border overflow-hidden bg-bg-secondary mx-auto mt-2 group">
                        <Image src={previewUrl} alt="Transfer Proof" fill sizes="128px" className="object-cover" />
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUploading}
                      className="bg-accent-gold text-white hover:bg-accent-gold-hover rounded-xl px-5 text-xs font-semibold"
                    >
                      {isUploading ? "Mengunggah..." : "Unggah Bukti Transfer"}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              // Proof has been uploaded
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-secondary p-4 rounded-xl border border-border text-xs">
                  <div>
                    <span className="text-text-secondary">Status Deposit:</span>
                    <p className="font-bold text-text-primary capitalize mt-0.5">
                      {transaction.deposit.status === "pending" && (
                        <Badge className="bg-bg-tertiary text-text-secondary">Menunggu Verifikasi Admin</Badge>
                      )}
                      {transaction.deposit.status === "verified" && (
                        <Badge className="bg-success text-white">Terverifikasi (Lunas)</Badge>
                      )}
                      {transaction.deposit.status === "refunded" && (
                        <Badge className="bg-info text-white">Sudah Direfund</Badge>
                      )}
                      {transaction.deposit.status === "forfeited" && (
                        <Badge className="bg-danger text-white">Deposit Hangus</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Uang Jaminan (Deposit):</span>
                    <p className="font-bold text-text-primary mt-0.5">
                      {formatRupiah(transaction.deposit.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Bank Pengirim:</span>
                    <p className="font-semibold text-text-primary mt-0.5">
                      {transaction.deposit.bankName || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Nomor Rekening Refund:</span>
                    <p className="font-mono font-semibold text-text-primary mt-0.5">
                      {transaction.deposit.accountNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase block">Foto Bukti Transfer yang Diunggah:</span>
                  <a
                    href={transaction.deposit.transferProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block w-48 aspect-[3/4] rounded-xl border border-border overflow-hidden bg-bg-secondary hover:opacity-90 transition-opacity"
                  >
                    <Image src={transaction.deposit.transferProofUrl} alt="Deposit Proof" fill sizes="192px" className="object-cover" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OFFLINE HANDOVER INFORMATION CARD */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent-gold" /> Alamat & Prosedur Offline Store
          </h3>

          <div className="text-xs leading-relaxed space-y-3">
            <div className="flex gap-2.5 items-start">
              <Clock className="h-4.5 w-4.5 text-accent-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary">Jam Operasional Toko:</span>
                <p className="text-text-secondary mt-0.5">
                  Senin - Sabtu: 09.00 - 18.00 WIB
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <MapPin className="h-4.5 w-4.5 text-accent-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary">Lokasi Pengambilan & Pengembalian:</span>
                <p className="text-text-secondary mt-0.5">
                  {storeSettings.address}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="h-4.5 w-4.5 text-accent-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary">Prosedur Serah Terima:</span>
                <ul className="list-disc pl-4 text-text-secondary mt-1 space-y-1">
                  <li>Tunjukkan KTP fisik Anda (harus sesuai dengan data KYC yang telah terverifikasi).</li>
                  <li>Tunjukkan halaman transaksi ini (kode transaksi digital) ke petugas toko.</li>
                  <li>Lakukan pengecekan fisik unit bersama staf toko sebelum meninggalkan gerai.</li>
                  <li>Pembayaran sisa tarif sewa / pembelian dilakukan langsung secara offline di kasir.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 3: Sidebar Timeline & Quick Actions */}
      <div className="space-y-6">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          {type === "sewa" && renderSewaTimeline()}
          {type === "beli" && renderBeliTimeline()}
          {type === "jual" && renderJualTimeline()}
        </div>

        <div className="bg-accent-gold-light/20 border border-accent-gold/20 rounded-2xl p-6 text-xs space-y-3">
          <h4 className="font-bold text-text-primary flex items-center gap-1.5">
            <Info className="h-4.5 w-4.5 text-accent-gold" /> Butuh Bantuan?
          </h4>
          <p className="text-text-secondary leading-relaxed">
            Jika Anda menemui kendala dalam transaksi, pengunggahan deposit, atau ingin melakukan pembatalan sewa, hubungi kami via WhatsApp.
          </p>
          <a
            href={`https://wa.me/${storeSettings.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center bg-accent-gold hover:bg-accent-gold-hover text-white py-3 rounded-xl font-semibold transition-colors duration-200"
          >
            Hubungi Admin via WA
          </a>
        </div>
      </div>
    </div>
  );
}
