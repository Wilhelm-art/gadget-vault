"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Settings, CreditCard, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SettingsFormProps {
  initialSettings: any;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States
  const [storeName, setStoreName] = useState(initialSettings.storeName || "");
  const [address, setAddress] = useState(initialSettings.address || "");
  const [phone, setPhone] = useState(initialSettings.phone || "");
  const [whatsapp, setWhatsapp] = useState(initialSettings.whatsapp || "");
  const [email, setEmail] = useState(initialSettings.email || "");
  const [googleMapsEmbed, setGoogleMapsEmbed] = useState(initialSettings.googleMapsEmbed || "");
  
  // Convert 0.20 to 20 for editing
  const [depositPercent, setDepositPercent] = useState(
    initialSettings.depositPercentage 
      ? (Number(initialSettings.depositPercentage) * 100).toString() 
      : "20"
  );

  const [bankName, setBankName] = useState(initialSettings.bankName || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(initialSettings.bankAccountNumber || "");
  const [bankAccountName, setBankAccountName] = useState(initialSettings.bankAccountName || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const percentage = parseFloat(depositPercent) / 100;

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          address,
          phone,
          whatsapp,
          email,
          googleMapsEmbed,
          depositPercentage: percentage,
          bankName,
          bankAccountNumber,
          bankAccountName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Pengaturan toko berhasil diperbarui!");
        router.refresh();
      } else {
        toast.error(data.message || "Gagal memperbarui pengaturan.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* SECTION 1: Store profile */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border/60 pb-3">
          <Settings className="w-4 h-4 text-accent-gold" /> Identitas & Kontak Toko
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Nama Toko *</label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="rounded-xl border-border text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Email Kontak *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-border text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Nomor Telepon Toko *</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border-border text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">WhatsApp Link / No. WA (Tanpa +) *</label>
            <Input
              placeholder="Contoh: 628123456789"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="rounded-xl border-border text-xs"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Alamat Lengkap Toko (Offline Store) *</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border border-border p-3 text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold"
            rows={3}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Google Maps Iframe Embed Code (HTML)</label>
          <textarea
            placeholder='Contoh: <iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
            value={googleMapsEmbed}
            onChange={(e) => setGoogleMapsEmbed(e.target.value)}
            className="w-full rounded-xl border border-border p-3 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-accent-gold"
            rows={3}
          />
          <p className="text-[10px] text-text-secondary leading-relaxed">
            Iframe ini akan dirender secara dinamis di halaman landing page dan kontak/tentang kami.
          </p>
        </div>
      </div>

      {/* SECTION 2: Finance & Bank Accounts */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border/60 pb-3">
          <CreditCard className="w-4 h-4 text-accent-gold" /> Rekening Refund & Transfer Jaminan (Deposit)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Nama Bank *</label>
            <Input
              placeholder="Contoh: Bank BCA"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="rounded-xl border-border text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Nomor Rekening Toko *</label>
            <Input
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              className="rounded-xl border-border text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Atas Nama Rekening *</label>
            <Input
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              className="rounded-xl border-border text-xs"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2 max-w-xs">
          <label className="text-xs font-semibold text-text-secondary">Persentase Deposit Jaminan (Luar Kota) *</label>
          <div className="relative rounded-xl overflow-hidden">
            <Input
              type="number"
              min="0"
              max="100"
              value={depositPercent}
              onChange={(e) => setDepositPercent(e.target.value)}
              className="rounded-xl border-border text-xs font-semibold"
              required
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">
              %
            </span>
          </div>
          <p className="text-[10px] text-text-secondary mt-1">
            Deposit = total_biaya_sewa × persentase jaminan. Standar default: 20%.
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white hover:from-accent-gold-hover hover:to-accent-gold px-6 py-5 rounded-xl text-xs font-bold gap-1.5 shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Menyimpan..." : "Simpan Semua Pengaturan"}
        </Button>
      </div>
    </form>
  );
}
