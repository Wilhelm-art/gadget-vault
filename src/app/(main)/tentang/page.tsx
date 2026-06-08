import React from "react";
import { MapPin, Phone, Mail, Clock, Award, Users, ShieldCheck } from "lucide-react";
import { getCachedStoreSettings } from "@/lib/queries";
import Breadcrumb from "@/components/layout/breadcrumb";

export const metadata = {
  title: "Tentang Kami",
  description: "Kenali lebih dekat GadgetVault, platform sewa, beli, dan jual gadget terbaik dan terpercaya di Cimahi & Bandung.",
};

export default async function AboutUsPage() {
  // Fetch store settings for location & email (Cached)
  const settings = await getCachedStoreSettings();
  
  const address = settings?.address || "Jl. Citeureup No.99, Cimahi Utara, Kota Cimahi, Jawa Barat 40512";
  const phone = settings?.phone || "022-1234567";
  const whatsapp = settings?.whatsapp || "628123456789";
  const email = settings?.email || "kontak@gadgetvault.com";
  const mapsEmbed = settings?.googleMapsEmbed;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <Breadcrumb />

      {/* Hero Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary font-display">
          Tentang GadgetVault
        </h1>
        <p className="text-sm text-text-secondary">
          Solusi sirkular gadget premium terlengkap dan terpercaya di wilayah Bandung & Cimahi.
        </p>
      </div>

      {/* Story section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed text-left">
          <h2 className="text-lg font-bold text-text-primary font-display border-b border-border/60 pb-2">
            Cerita Perjalanan Kami
          </h2>
          <p>
            Didirikan di Kota Cimahi, <strong>GadgetVault</strong> lahir sebagai respon atas tingginya kebutuhan fotografer, videografer, konten kreator, dan tech-enthusiast akan perangkat premium berbiaya efisien. Kami percaya bahwa untuk menghasilkan karya luar biasa atau menikmati teknologi terbaru, Anda tidak selalu harus membelinya.
          </p>
          <p>
            Melalui model bisnis sirkular terintegrasi <strong>Sewa, Beli, dan Jual</strong>, kami mempermudah akses gadget premium (HP Flagship, Kamera Mirrorless, Drone, Gimbal) dengan sistem verifikasi KYC digital instan, serta kebijakan <em>Bebas Deposit Jaminan</em> bagi warga ber-KTP Bandung Raya dan Cimahi.
          </p>
          <p>
            Keamanan unit dan kenyamanan Anda adalah prioritas utama kami. Staf ahli kami melakukan pengecekan berkala (grading) fisik dan sistem operasi secara ketat agar setiap gadget yang berada di tangan Anda berfungsi sempurna layaknya perangkat baru.
          </p>
        </div>

        {/* Stats metrics */}
        <div className="md:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-bg-secondary p-5 rounded-2xl border border-border text-center space-y-1">
            <Users className="w-6 h-6 text-accent-gold mx-auto" />
            <span className="block font-bold text-text-primary text-lg sm:text-xl">1,000+</span>
            <span className="text-[10px] text-text-secondary uppercase">Penyewa Aktif</span>
          </div>
          <div className="bg-bg-secondary p-5 rounded-2xl border border-border text-center space-y-1">
            <Award className="w-6 h-6 text-accent-gold mx-auto" />
            <span className="block font-bold text-text-primary text-lg sm:text-xl">50+</span>
            <span className="text-[10px] text-text-secondary uppercase">Unit Premium</span>
          </div>
          <div className="bg-bg-secondary p-5 rounded-2xl border border-border text-center space-y-1 col-span-2">
            <ShieldCheck className="w-6 h-6 text-accent-gold mx-auto" />
            <span className="block font-bold text-text-primary text-base">Garansi Unit Asli</span>
            <span className="text-[9px] text-text-secondary uppercase">Lolos Uji Fisik 100%</span>
          </div>
        </div>
      </div>

      {/* Location card & contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-5 bg-white border border-border p-6 sm:p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="text-base font-bold font-display text-text-primary">Kontak & Alamat</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Tim CS kami siap membantu menjawab pertanyaan seputar ketersediaan unit, pengiriman berkas KYC, atau pengajuan deposit jaminan.
            </p>
          </div>

          <div className="space-y-4 border-t border-border/60 pt-6 text-xs text-left">
            <div className="flex gap-3 items-start">
              <MapPin className="w-4.5 h-4.5 text-accent-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-text-primary">Alamat Gerai:</span>
                <p className="text-text-secondary mt-0.5 leading-relaxed">{address}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Phone className="w-4.5 h-4.5 text-accent-gold shrink-0" />
              <div>
                <span className="font-bold text-text-primary">Telepon Toko:</span>
                <p className="text-text-secondary mt-0.5">{phone}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Mail className="w-4.5 h-4.5 text-accent-gold shrink-0" />
              <div>
                <span className="font-bold text-text-primary">Email Resmi:</span>
                <p className="text-text-secondary mt-0.5">{email}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Clock className="w-4.5 h-4.5 text-accent-gold shrink-0" />
              <div>
                <span className="font-bold text-text-primary">Jam Operasional Kasir:</span>
                <p className="text-text-secondary mt-0.5">Senin - Sabtu: 09.00 - 18.00 WIB</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/60">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center bg-accent-gold hover:bg-accent-gold-hover text-white py-3 rounded-xl text-xs font-bold transition-all"
            >
              Hubungi CS WhatsApp
            </a>
          </div>
        </div>

        {/* Embedded map */}
        <div className="lg:col-span-7 bg-bg-secondary border border-border rounded-3xl overflow-hidden min-h-[300px] shadow-sm relative">
          {mapsEmbed ? (
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: mapsEmbed }}
            />
          ) : (
            <iframe
              title="Google Maps Lokasi Toko"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9785871234125!2d107.5453!3d-6.8724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e4...!2sCimahi!5e0!3m2!1sid!2sid!4v1700000000000"
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
