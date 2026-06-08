"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Phone, MapPin, Calendar, 
  ShieldCheck, ShieldAlert, Heart, History, Clock,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CustomerDetailClientProps {
  customer: any;
  rentals: any[];
  purchases: any[];
  kycDoc: any;
}

export default function CustomerDetailClient({
  customer,
  rentals,
  purchases,
  kycDoc,
}: CustomerDetailClientProps) {
  const router = useRouter();
  const [isBlacklisted, setIsBlacklisted] = useState(customer.isBlacklisted);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBlacklist = async () => {
    setIsLoading(true);
    const newStatus = !isBlacklisted;
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlacklisted: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsBlacklisted(newStatus);
        if (newStatus) {
          toast.warning("Pelanggan berhasil masuk ke daftar Blacklist.");
        } else {
          toast.success("Pelanggan berhasil dihapus dari Blacklist.");
        }
        router.refresh();
      } else {
        toast.error(data.message || "Gagal mengubah status blacklist.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* COLUMN 1: Profile & KYC Details */}
      <div className="space-y-6">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col items-center text-center pb-4 border-b border-border/60">
            <div className="h-16 w-16 rounded-full bg-accent-gold-light text-accent-gold flex items-center justify-center font-bold text-xl uppercase mb-3">
              {customer.name.charAt(0)}
            </div>
            <h2 className="font-bold text-text-primary text-base flex items-center gap-1.5 justify-center">
              {customer.name}
              {isBlacklisted && <Badge className="bg-danger text-white py-0.5 px-1.5 text-[9px] font-bold">Blacklisted</Badge>}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">{customer.email}</p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-accent-gold shrink-0" />
              <span className="font-mono text-text-primary">{customer.phone || "-"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
              <span className="text-text-primary">
                {customer.address || "-"}, {customer.city || ""}, {customer.province || ""}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-accent-gold shrink-0" />
              <span className="text-text-secondary">
                Terdaftar: {new Date(customer.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Blacklist Toggle Button */}
          <div className="pt-4 border-t border-border/60">
            <Button
              onClick={handleToggleBlacklist}
              disabled={isLoading}
              className={`w-full py-5 rounded-xl font-bold text-xs ${
                isBlacklisted 
                  ? "bg-success text-white hover:bg-success/90" 
                  : "bg-danger text-white hover:bg-danger/90"
              }`}
            >
              {isLoading 
                ? "Memproses..." 
                : isBlacklisted 
                ? "Buka Blacklist Pelanggan" 
                : "Blacklist Pelanggan"}
            </Button>
          </div>
        </div>

        {/* KYC Document Card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-accent-gold" /> Berkas KYC Identitas
          </h3>

          {kycDoc ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Nomor KTP:</span>
                <span className="font-mono font-bold text-text-primary">{kycDoc.ktpNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status Verifikasi:</span>
                <span className="font-bold uppercase text-text-primary">{kycDoc.status}</span>
              </div>

              {kycDoc.signedKtpFront && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-text-secondary uppercase block">Foto KTP Depan:</span>
                  <a
                    href={kycDoc.signedKtpFront}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-[4/3] rounded-lg overflow-hidden border border-border"
                  >
                    <img src={kycDoc.signedKtpFront} alt="KTP" className="w-full h-full object-cover" />
                  </a>
                </div>
              )}

              {kycDoc.signedSelfieKtp && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-text-secondary uppercase block">Foto Selfie + KTP:</span>
                  <a
                    href={kycDoc.signedSelfieKtp}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-[4/3] rounded-lg overflow-hidden border border-border"
                  >
                    <img src={kycDoc.signedSelfieKtp} alt="Selfie" className="w-full h-full object-cover" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-bg-secondary border border-border rounded-xl text-center text-text-secondary text-xs">
              Pelanggan belum mengunggah dokumen KYC.
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2 & 3: Riwayat Transaksi */}
      <div className="lg:col-span-2 space-y-6">
        {/* RENTALS HISTORY */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <History className="w-4.5 h-4.5 text-accent-gold" /> Riwayat Sewa Gadget ({rentals.length})
          </h3>

          <div className="divide-y divide-border/60">
            {rentals.length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">Belum ada riwayat transaksi sewa.</p>
            ) : (
              rentals.map((r) => (
                <div key={r.id} className="py-3 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                  <div>
                    <span className="font-mono font-bold text-[10px] text-accent-gold-hover">{r.transactionCode}</span>
                    <p className="font-bold text-text-primary mt-0.5">{r.product.name}</p>
                    <p className="text-text-secondary text-[10px] mt-0.5">
                      {new Date(r.startDate).toLocaleDateString("id-ID")} - {new Date(r.endDate).toLocaleDateString("id-ID")} ({r.durationDays} hari)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block">{formatRupiah(r.totalAmount)}</span>
                    <span className="text-[10px] text-text-secondary block mt-0.5 capitalize">{r.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PURCHASES HISTORY */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <ShoppingBag className="w-4.5 h-4.5 text-accent-gold" /> Riwayat Beli Gadget ({purchases.length})
          </h3>

          <div className="divide-y divide-border/60">
            {purchases.length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">Belum ada riwayat transaksi beli.</p>
            ) : (
              purchases.map((p) => (
                <div key={p.id} className="py-3 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                  <div>
                    <span className="font-mono font-bold text-[10px] text-accent-gold-hover">{p.transactionCode}</span>
                    <p className="font-bold text-text-primary mt-0.5">{p.product.name}</p>
                    <p className="text-text-secondary text-[10px] mt-0.5">
                      Diajukan: {new Date(p.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block">{formatRupiah(p.amount)}</span>
                    <span className="text-[10px] text-text-secondary block mt-0.5 capitalize">{p.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
