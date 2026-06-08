"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, User, Phone, MapPin, BadgeCheck, ShieldAlert, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProfileFormProps {
  user: any;
  stats: {
    activeRentals: number;
    completedTx: number;
    wishlistCount: number;
  };
}

export default function ProfileForm({ user, stats }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [city, setCity] = useState(user.city || "");
  const [province, setProvince] = useState(user.province || "");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          city,
          province,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Profil Anda berhasil diperbarui!");
        router.refresh();
      } else {
        toast.error(data.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success text-white font-bold py-1 px-3">Verified ✓</Badge>;
      case "pending":
        return <Badge className="bg-warning text-white font-bold py-1 px-3">Pending Review ⏳</Badge>;
      case "rejected":
        return <Badge className="bg-danger text-white font-bold py-1 px-3">Rejected ✗</Badge>;
      default:
        return <Badge className="bg-bg-tertiary text-text-secondary border border-border font-bold py-1 px-3">Belum Verifikasi</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-text-secondary uppercase block">Sewa Aktif</span>
          <span className="font-bold text-text-primary text-base sm:text-lg mt-1 block">
            {stats.activeRentals}
          </span>
        </div>
        <div className="bg-white border border-border p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-text-secondary uppercase block">Transaksi Selesai</span>
          <span className="font-bold text-text-primary text-base sm:text-lg mt-1 block">
            {stats.completedTx}
          </span>
        </div>
        <div className="bg-white border border-border p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-text-secondary uppercase block">Wishlist</span>
          <span className="font-bold text-text-primary text-base sm:text-lg mt-1 block">
            {stats.wishlistCount}
          </span>
        </div>
      </div>

      {/* 2. Profile Details Form */}
      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <User className="w-4 h-4 text-accent-gold" /> Data Diri Anda
            </h2>
            <p className="text-[10px] text-text-secondary">Informasi kontak dan alamat pengiriman / deposit Anda.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary">KYC:</span>
            {getKycBadge(user.kycStatus)}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary">Nama Lengkap *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-border text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary">Email (Tidak dapat diubah)</label>
              <Input
                value={user.email}
                disabled
                className="rounded-xl border-border bg-bg-secondary text-xs text-text-secondary cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary">Nomor Telepon / HP *</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border-border text-xs"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary">Kota *</label>
              <Input
                placeholder="Contoh: Cimahi, Bandung, Jakarta"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl border-border text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary">Provinsi *</label>
              <Input
                placeholder="Contoh: Jawa Barat"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="rounded-xl border-border text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-text-secondary">Alamat Rumah Lengkap (Sesuai KTP) *</label>
            <textarea
              placeholder="Tulis alamat rumah lengkap Anda di sini..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-border p-3 text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold"
              rows={3}
              required
            />
          </div>

          {user.kycStatus !== "verified" && (
            <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed flex gap-2">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Akses Sewa Terbatas:</strong> Anda belum memverifikasi berkas identitas KYC. Silakan kunjungi menu <strong>Verifikasi KYC</strong> di sidebar untuk mengunggah foto KTP agar Anda bisa menyewa perangkat gadget di GadgetVault.
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-border/60">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white hover:from-accent-gold-hover hover:to-accent-gold px-6 py-5 rounded-xl font-bold shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan Profil"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
