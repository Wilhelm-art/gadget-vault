import React from "react";
import Link from "next/link";
import { 
  Smartphone, Camera, ShieldCheck, Heart, 
  MapPin, Clock, ArrowRight, Star, BadgeCheck, Zap
} from "lucide-react";
import { getCachedFeaturedProducts, getCachedStoreSettings } from "@/lib/queries";
import ProductCard from "@/components/product/product-card";
import CinematicBackground from "@/components/layout/cinematic-background";



export const metadata = {
  title: "GadgetVault — Jual, Beli & Sewa Gadget Cimahi Bandung",
  description: "Platform sewa, beli, dan jual gadget premium (HP, Kamera, Drone, Aksesoris) offline-first di Bandung & Cimahi. KYC instan & jaminan jaminan transparan.",
};

export default async function HomePage() {
  // 1. Fetch featured products (Cached)
  const featuredProducts = await getCachedFeaturedProducts();

  // 2. Fetch store settings for location embed & address (Cached)
  const settings = await getCachedStoreSettings();
  const address = settings?.address || "Jl. Citeureup No.99, Cimahi Utara, Kota Cimahi, Jawa Barat 40512";
  const whatsapp = settings?.whatsapp || "628123456789";
  const operatingHours = "Senin - Sabtu: 09.00 - 18.00 WIB";

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#070706] text-white border-b border-white/5 py-24 sm:py-32 overflow-hidden">
        {/* Cinematic Backdrop with Particle/Video animation */}
        <CinematicBackground />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left animate-fade-in-up">
            <Badge className="bg-accent-gold/10 text-accent-gold border-accent-gold/25 font-bold px-3 py-1 text-xs backdrop-blur-md">
              ★ PREMIUM GADGET STORE
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              Sewa, Beli & Jual <br />
              <span className="text-accent-gold">Gadget Premium</span> di Cimahi
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
              Dapatkan akses ke handphone flagship, kamera mirrorless profesional, drone sinematik, dan berbagai aksesoris berkualitas. Transaksi aman secara offline (COD toko), verifikasi KYC instan, bebas deposit untuk warga Bandung/Cimahi.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/sewa"
                className="bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white px-6 py-3.5 rounded-xl text-xs font-bold shadow-md hover:from-accent-gold-hover hover:to-accent-gold transition-all duration-200"
              >
                Mulai Sewa Sekarang
              </Link>
              <Link
                href="/katalog"
                className="bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 px-6 py-3.5 rounded-xl text-xs font-bold transition-all duration-200 backdrop-blur-sm"
              >
                Jelajahi Katalog
              </Link>
              <Link
                href="/jual"
                className="bg-accent-gold-light/10 text-accent-gold hover:bg-accent-gold-light/20 border border-accent-gold/20 px-6 py-3.5 rounded-xl text-xs font-bold transition-all duration-200 backdrop-blur-sm"
              >
                Jual Gadget Anda
              </Link>
            </div>
          </div>

          {/* Visual element on right side */}
          <div className="lg:col-span-5 relative flex justify-center animate-fade-in">
            <div className="relative w-72 h-96 sm:w-80 sm:h-[450px] rounded-3xl border border-white/15 bg-black/40 p-4 shadow-[0_0_50px_rgba(201,169,110,0.08)] backdrop-blur-md rotate-3 hover:rotate-0 transition-all duration-500">
              <div className="absolute top-4 left-4 right-4 bottom-4 rounded-2xl overflow-hidden bg-black/30 flex flex-col justify-between p-6">
                <div>
                  <span className="text-[10px] font-bold text-accent-gold uppercase tracking-wider">FEATURED UNIT</span>
                  <h3 className="font-display font-bold text-white text-xl mt-1">iPhone 14 Pro Max</h3>
                  <p className="text-[11px] text-neutral-400 mt-1">Tersedia untuk disewa mulai dari Rp 150k/hari</p>
                </div>
                <div className="w-full h-56 relative bg-transparent flex items-center justify-center my-4 overflow-visible">
                  <div className="w-32 h-32 rounded-full bg-accent-gold-light/20 absolute blur-2xl animate-pulse" />
                  
                  {/* Optimized 3D video tag (hidden by default until file is supplied) */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-auto h-44 object-contain relative z-10 hidden"
                  >
                    <source src="/hero-3d.webm" type="video/webm" />
                    <source src="/hero-3d.mp4" type="video/mp4" />
                  </video>

                  {/* High-Performance 3D CSS Smartphone Mockup (zero loading latency) */}
                  <div className="phone-3d-wrapper relative z-10 scale-[0.85] origin-center">
                    <div className="phone-3d-device">
                      {/* Sides (Depth) */}
                      <div className="phone-3d-side-left" />
                      <div className="phone-3d-side-right" />
                      <div className="phone-3d-side-top" />
                      <div className="phone-3d-side-bottom" />
                      
                      {/* Front (Screen) */}
                      <div className="phone-3d-face phone-3d-front flex flex-col justify-between p-3 select-none">
                        {/* Dynamic Island */}
                        <div className="w-10 h-3 bg-black rounded-full mx-auto mt-1" />
                        
                        {/* Wallpaper Screen Grid */}
                        <div className="flex-1 flex flex-col justify-center items-center gap-1.5 my-2.5 rounded-2xl bg-gradient-to-br from-accent-gold/20 via-[#0e0e0e] to-accent-gold-light/10 border border-white/5 shadow-inner">
                          <span className="text-[8px] font-bold text-accent-gold tracking-widest uppercase">VAULT</span>
                          <span className="text-[11px] font-extrabold text-white font-sans tracking-wide">iPhone 14</span>
                          <span className="text-[7px] text-text-secondary uppercase">Pro Max</span>
                        </div>
                        
                        {/* Speaker Line */}
                        <div className="w-8 h-[2px] bg-white/20 rounded-full mx-auto" />
                      </div>
                      
                      {/* Back (Chassis & Camera Bump) */}
                      <div className="phone-3d-face phone-3d-back p-3 select-none">
                        {/* Apple-style mock logo */}
                        <div className="w-6 h-6 rounded-full bg-accent-gold-light/10 border border-accent-gold/20 flex items-center justify-center mb-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-accent-gold" />
                        </div>
                        
                        {/* Triple Camera Array Layout */}
                        <div className="w-12 h-12 bg-black/40 rounded-xl border border-white/10 p-1.5 grid grid-cols-2 gap-1 absolute top-4 left-4">
                          <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                          </div>
                          <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                          </div>
                          <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-black" />
                          </div>
                          <div className="w-2 h-2 rounded-full bg-neutral-800 self-center justify-self-center" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  href="/sewa"
                  className="w-full text-center bg-white text-black py-2.5 rounded-xl text-xs font-bold hover:bg-accent-gold hover:text-white transition-colors"
                >
                  Booking Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <span className="text-[10px] font-bold text-accent-gold tracking-widest uppercase">Kategori Perangkat</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-display">
            Pilih Gadget yang Anda Butuhkan
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            Katalog lengkap gadget pilihan siap sewa atau beli COD offline
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CategoryCard
            name="Handphone & Tablet"
            desc="iPhone flagship, Samsung Ultra, iPad Pro, dll."
            slug="handphone"
            icon={<Smartphone className="w-6 h-6 text-accent-gold" />}
          />
          <CategoryCard
            name="Kamera & Lensa"
            desc="Sony Alpha, Fujifilm, lensa wide/tele, dll."
            slug="kamera"
            icon={<Camera className="w-6 h-6 text-accent-gold" />}
          />
          <CategoryCard
            name="Drone & Stabilizer"
            desc="DJI Mavic, Avata, stabilizer gimbal handal."
            slug="drone"
            icon={<Zap className="w-6 h-6 text-accent-gold" />}
          />
          <CategoryCard
            name="Aksesoris Premium"
            desc="Mic wireless, tripod, battery pack, dll."
            slug="aksesoris"
            icon={<BadgeCheck className="w-6 h-6 text-accent-gold" />}
          />
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[10px] font-bold text-accent-gold tracking-widest uppercase block mb-1">Rekomendasi Terbaik</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-display">
                Unit Featured Terlaris
              </h2>
            </div>
            <Link
              href="/katalog"
              className="text-xs font-bold text-accent-gold hover:text-accent-gold-hover flex items-center gap-1 hover:underline"
            >
              Lihat Semua Katalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
            {featuredProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 4. VALUE PROPOSITION (USP) SECTION */}
      <section className="bg-bg-secondary border-y border-border py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <span className="text-[10px] font-bold text-accent-gold tracking-widest uppercase">Keunggulan Kami</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-display">
              Kenapa Memilih GadgetVault?
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Layanan jual, beli, dan sewa gadget terbaik di Cimahi/Bandung dengan transparansi penuh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <UspCard
              title="KYC Aman & Cepat"
              desc="Verifikasi dokumen identitas secara digital dalam waktu 1x24 jam untuk keamanan bersama."
            />
            <UspCard
              title="Bebas Jaminan KTP Lokal"
              desc="Warga Kota Bandung & Cimahi tidak perlu mentransfer deposit uang jaminan sewa gadget."
            />
            <UspCard
              title="Cek Unit Offline (COD)"
              desc="Datang langsung ke gerai kami untuk memvalidasi kondisi fisik unit sebelum membawa pulang."
            />
            <UspCard
              title="Unit Premium Terawat"
              desc="Seluruh unit gadget kami orisinal, mulus, bergaransi, dan diuji berkala oleh tim ahli."
            />
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <span className="text-[10px] font-bold text-accent-gold tracking-widest uppercase">Ulasan Pelanggan</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-display">
            Apa Kata Mereka?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard
            name="Andi Wijaya"
            role="Penyewa Drone DJI · Dago"
            quote="Sewa drone DJI Air untuk kebutuhan video event di Bandung Utara gampang banget. Persyaratannya KTP lokal langsung approve. Unit DJI-nya mulus, baterai aman. Mantap!"
          />
          <TestimonialCard
            name="Rina Kartika"
            role="Penyewa Kamera Sony A7 · Cimahi"
            quote="Awalnya ragu sewa kamera mirrorless mahal, tapi pas datang ke gerai stafnya ramah dan bantuin cek kelengkapan lensa. Bebas deposit jaminan juga karena saya KTP Cimahi."
          />
          <TestimonialCard
            name="Budi Pratama"
            role="Penjual HP Bekas · Soreang"
            quote="Iseng ajukan penawaran jual iPhone 12 Pro nganggur lewat form di website. Besoknya ditaksir admin harga oke, pas ketemuan di gerai langsung dibayar cash tanpa nego ribet."
          />
        </div>
      </section>

      {/* 6. STORE INFO & LOKASI PETA SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Info details */}
          <div className="lg:col-span-5 bg-white border border-border p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-accent-gold tracking-wider uppercase">KUNJUNGI GERAI KAMI</span>
              <h3 className="text-2xl font-bold font-display text-text-primary">GadgetVault Cimahi</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Silakan datang langsung ke toko kami untuk mengambil unit sewa, melakukan cek fisik COD, atau mencairkan dana penjualan gadget Anda.
              </p>
            </div>

            <div className="space-y-3.5 border-t border-border/60 pt-6 text-xs">
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-text-primary">Alamat Toko:</span>
                  <p className="text-text-secondary mt-0.5">{address}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Clock className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-text-primary">Jam Operasional:</span>
                  <p className="text-text-secondary mt-0.5">{operatingHours}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-accent-gold hover:bg-accent-gold-hover text-white py-3.5 rounded-xl text-xs font-bold transition-all"
              >
                Tanya Jawab via WhatsApp
              </a>
            </div>
          </div>

          {/* Maps Embed iframe */}
          <div className="lg:col-span-7 bg-bg-secondary border border-border rounded-3xl overflow-hidden min-h-[300px] shadow-sm relative">
            {settings?.googleMapsEmbed ? (
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
              />
            ) : (
              <iframe
                title="Peta Lokasi GadgetVault"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1980.5985871234125!2d107.5453!3d-6.8724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e4...!2sCimahi!5e0!3m2!1sid!2sid!4v1700000000000"
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({
  name,
  desc,
  slug,
  icon,
}: {
  name: string;
  desc: string;
  slug: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={`/katalog?category=${slug}`}
      className="bg-white border border-border rounded-2xl p-6 hover:border-accent-gold hover:shadow-md transition-all duration-300 group text-left block"
    >
      <div className="p-3 bg-accent-gold-light/40 rounded-xl w-fit group-hover:bg-accent-gold group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-text-primary text-sm mt-4 group-hover:text-accent-gold transition-colors">
        {name}
      </h3>
      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
        {desc}
      </p>
    </Link>
  );
}

function UspCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white border border-border p-6 rounded-2xl shadow-sm text-left space-y-2">
      <div className="h-2 w-10 bg-accent-gold rounded-full" />
      <h3 className="font-bold text-text-primary text-sm pt-2">{title}</h3>
      <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

function TestimonialCard({
  name,
  role,
  quote,
}: {
  name: string;
  role: string;
  quote: string;
}) {
  return (
    <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between text-left space-y-4">
      <p className="text-xs text-text-secondary italic leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex justify-between items-center pt-4 border-t border-border/60">
        <div>
          <h4 className="font-bold text-text-primary text-xs">{name}</h4>
          <span className="text-[10px] text-text-secondary mt-0.5 block">{role}</span>
        </div>
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-current" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Custom badge component
function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${className}`}>
      {children}
    </span>
  );
}
