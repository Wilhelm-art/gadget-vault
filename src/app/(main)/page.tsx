import React from "react";
import Link from "next/link";
import { 
  Smartphone, Camera, ShieldCheck, Heart, 
  MapPin, Clock, ArrowRight, Star, BadgeCheck, Zap,
  Tag, Store, Headphones, ArrowUpRight
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
    <div className="space-y-24 pb-20 bg-[#070706] text-[#e5e2df] overflow-x-hidden font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-border/10 py-16 sm:py-24">
        {/* Cinematic Backdrop with Particle/Video animation */}
        <CinematicBackground />

        {/* Atmospheric Glow Background */}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8 text-left animate-fade-in-up">
            <div className="space-y-4">
              <span className="font-mono text-xs text-primary hud-bracket uppercase tracking-[0.15em]">
                PREMIUM GADGET ECOSYSTEM
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] tracking-tight">
                Sewa, Beli & Jual <br />
                <span className="text-primary italic font-normal">Gadget Premium</span> <br />
                di Cimahi
              </h1>
            </div>
            <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
              Dapatkan akses ke handphone flagship, kamera mirrorless profesional, drone sinematik, dan berbagai aksesoris berkualitas. Transaksi aman secara offline (COD toko), verifikasi KYC instan, bebas deposit untuk warga Bandung/Cimahi.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/sewa"
                className="bg-primary text-primary-foreground font-mono text-xs font-bold px-8 py-4.5 tracking-widest gold-hover transition-all duration-300 flex items-center gap-3 rounded-none"
              >
                MULAI SEWA SEKARANG
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/katalog"
                className="glass-card font-mono text-xs font-bold px-8 py-4.5 tracking-widest text-[#e5e2df] hover:bg-primary/10 transition-all duration-300 border border-primary/20 rounded-none"
              >
                JELAJAHI KATALOG
              </Link>
              <Link
                href="/jual"
                className="font-mono text-xs font-bold px-6 py-4.5 tracking-widest text-text-secondary hover:text-primary transition-all duration-300 flex items-center gap-2 rounded-none"
              >
                <Tag className="w-4 h-4" />
                JUAL GADGET ANDA
              </Link>
            </div>
          </div>

          {/* Right Column (The Vault Hologram) */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[500px] sm:h-[600px] w-full">
            <div className="floating z-20 w-full max-w-[420px]">
              <div className="glass-card rounded-xl p-1 overflow-hidden">
                <div className="relative bg-[#0e0e0d]/80 p-6 sm:p-8 rounded-lg border border-primary/10">
                  {/* HUD Decor */}
                  <div className="absolute top-4 left-4 border-l-2 border-t-2 border-primary w-8 h-8 opacity-50"></div>
                  <div className="absolute bottom-4 right-4 border-r-2 border-b-2 border-primary w-8 h-8 opacity-50"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="font-mono text-xs text-text-secondary uppercase tracking-wider">
                      STATUS: <span className="text-primary font-bold">[ READY ]</span>
                    </div>
                    <div className="font-mono text-xs text-primary font-bold">001-IPV-PRO</div>
                  </div>
                  
                  <div className="relative group flex justify-center">
                    <img 
                      alt="iPhone 14 Pro Max" 
                      className="w-auto h-[300px] sm:h-[360px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transform group-hover:scale-105 transition-transform duration-700" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6zz3eFrt6v2Tb4Jh8kCLTwi8Kv_wh-NFtu3C8KkMBq7zFBlJz0-t2zSfOGQ5eKavxGpiXMZaBdVwHrr8YhMevFnvrIi5uSFtvCN4VV5F_hWpnjX5eC-1tBwrFrLdfvLps0P1NzgFdPwRupKYgNDAlpAMJX91rfvpFfJhgkyzfJbVStdUZCYcNxKhNS8Dwh8sIKqE88bIxOH0_hg9AGcqofgdkErbp8V5DD6m4cQBAXk4EctdiE49snvgIznbjtfnSkLBQWmrWces" 
                    />
                    {/* Scanning Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  <div className="mt-8 space-y-2">
                    <div className="font-mono text-[10px] tracking-[0.3em] text-primary font-bold uppercase">
                      FEATURED UNIT
                    </div>
                    <div className="flex justify-between items-end">
                      <h3 className="font-display text-xl text-white font-bold">iPhone 14 Pro Max</h3>
                      <div className="text-right">
                        <div className="font-mono text-[9px] text-text-secondary uppercase">START FROM</div>
                        <div className="font-mono text-base font-bold text-primary">IDR 145K/Day</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Radial Glow behind the card */}
            <div className="absolute w-[350px] h-[350px] bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* 2. CURATED COLLECTIONS BENTO SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-4">
            <span className="font-mono text-xs text-primary hud-bracket uppercase tracking-widest">
              OUR FLEET
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">
              Curated Collections
            </h2>
          </div>
          <Link 
            href="/katalog"
            className="font-mono text-xs text-text-secondary tracking-widest flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
          >
            VIEW ALL CATEGORIES 
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Smartphones */}
          <Link 
            href="/katalog?category=handphone"
            className="md:col-span-8 group cursor-pointer"
          >
            <div className="glass-card h-80 rounded-xl p-8 flex flex-col justify-between overflow-hidden relative border border-primary/10">
              <img 
                alt="Smartphones"
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7d-vAJ9HaR3AZJr1Yh11KtITHQxS2eym2d0zz1kz6P4VNzUltwceGzuMGASuFzEaSY8P1qgdsaWEFOfrcIxr6-VoKF1iCyjh5Dost2Es9JvgHS2ZVL7lmLCiwl1uNoKnYlo4zK6pDimwtN9ysXPCNOiJAJU56ssaNcLaVxUMGb3dkV72BvRKVmmshE2EHFkKmO3MRYpF78cNp5wKYjToie682Dm3Nubn59kr0378k9fW3EzKknEx41Jg1wF_xV15h-WKduMLW_uA" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-0" />
              <div className="z-10 flex justify-between items-start">
                <h3 className="font-display text-2xl font-bold text-white">Smartphones</h3>
                <div className="font-mono text-[10px] tracking-wider text-primary px-3 py-1 border border-primary/30">
                  LATEST GEN
                </div>
              </div>
              <div className="z-10">
                <p className="text-sm text-text-secondary mb-4 max-w-sm leading-relaxed">
                  From iPhone 15 Pro series to Samsung S24 Ultra. Optimized for productivity and social impact.
                </p>
                <span className="font-mono text-xs text-primary font-bold group-hover:text-white transition-colors flex items-center gap-1">
                  DISCOVER NOW <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Cameras */}
          <Link 
            href="/katalog?category=kamera"
            className="md:col-span-4 group cursor-pointer"
          >
            <div className="glass-card h-80 rounded-xl p-8 flex flex-col justify-between overflow-hidden relative border border-primary/10">
              <img 
                alt="Cameras"
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-1000" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-UfNnGVmpF69QU9khyB7AyVhRAybBaggO7L2c1CV0gm3ZurE6ZUEBAo4dbyRhj82rJ8dOZHfHrTs1XnDVsbg-bMSeQh5sWkh8vIwZwRjhMlwdDOf178zkHYmnaAd7U1vDYI8f4x-Jwyqb8ahoXXBa5ePyk8Snl8-uDeraDtv96I0uB68Tw9sxy6jKFyWZmX58e6op-PPTaLhloKDQ6_yROYxkNXuIKdOkdjl5sfCFG6sZ1Py-CVX_P4qIaEl9UndqbzL4opGCgZg" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-0" />
              <div className="z-10 flex justify-between items-start">
                <h3 className="font-display text-2xl font-bold text-white">Cameras</h3>
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div className="z-10">
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  Sony A7IV, Lumix S5IIX, & FujiFilm masterpieces.
                </p>
                <span className="font-mono text-xs text-primary font-bold group-hover:text-white transition-colors flex items-center gap-1">
                  EXPLORE <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Drones */}
          <Link 
            href="/katalog?category=drone"
            className="md:col-span-4 group cursor-pointer"
          >
            <div className="glass-card h-80 rounded-xl p-8 flex flex-col justify-between overflow-hidden relative border border-primary/10">
              <img 
                alt="Drones"
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-1000" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFqai6lOU6BIPLomupm4E_WRN53MWPBiTCWSrgqmjEdWOKFyLYCEg7_CHaaFw0w9xz9j1YF5mAow1MAy9a9-ZBFDCE_-Ai5cB-5NJmGOTMY9kWE6kbGJRfw7sTfk-EY5fXrcvM2cZTy3NmVotPePk0R116imysWJlmWlwoYidzuwes7aPbrR10F3S6AyVZ-OgpRM6b0ar6M3t-URQPTOOBSPsVKxQfwPq0ikkdclP7Umv-kQ-M8uMlxSee65W7g0tVcUHW9a_FMwc" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-0" />
              <div className="z-10 flex justify-between items-start">
                <h3 className="font-display text-2xl font-bold text-white">Drones</h3>
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="z-10">
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  DJI Air 3, Mavic 3 Pro, and FPV drones.
                </p>
                <span className="font-mono text-xs text-primary font-bold group-hover:text-white transition-colors flex items-center gap-1">
                  EXPLORE <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* Accessories */}
          <Link 
            href="/katalog?category=aksesoris"
            className="md:col-span-8 group cursor-pointer"
          >
            <div className="glass-card h-80 rounded-xl p-8 flex flex-col justify-between overflow-hidden relative border border-primary/10">
              <img 
                alt="Accessories"
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgK-EZXG25JqJ6onx8pJpqalcu7JXrFHBcrmw0SDxqaOJ62ETwooN1I4dy25T6CCiNKFmZkW3iPiFdDLErHhaD93PVsbhBGG6psHFHIT4WHA_XbjH1LP251t9fFvR4JKNTXZzwuhtGOW8Myjd8SPupiU69aauhamAj4EVxrToc1PaDyl6H0HRVhVEsQSmdIgUJGldxb5Fr9G5wDHwJ2RghOfjsP9Eb_6ZIvPj2BRNq2r-djF8YB52vVlCybB591Esv6RA9kQtquuM" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-0" />
              <div className="z-10 flex justify-between items-start">
                <h3 className="font-display text-2xl font-bold text-white">Accessories</h3>
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div className="z-10">
                <p className="text-sm text-text-secondary mb-4 max-w-md leading-relaxed">
                  Essential gears for your digital lifestyle. Tripods, microphones, battery packs, and high-performance chargers.
                </p>
                <span className="font-mono text-xs text-primary font-bold group-hover:text-white transition-colors flex items-center gap-1">
                  DISCOVER NOW <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="font-mono text-xs text-primary hud-bracket uppercase tracking-widest block mb-2">
                REKOMENDASI TERBAIK
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white font-display">
                Unit Featured Terlaris
              </h2>
            </div>
            <Link
              href="/katalog"
              className="font-mono text-xs text-primary hover:text-white flex items-center gap-1 hover:underline tracking-wider"
            >
              LIHAT SEMUA KATALOG <ArrowRight className="w-4 h-4" />
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
      <section className="relative py-24 bg-[#0e0e0d] border-y border-border/10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <span className="font-mono text-xs text-primary hud-bracket uppercase tracking-widest">
              VAULT SECURITY
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">
              Transact with Total Confidence
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Layanan jual, beli, dan sewa gadget terbaik di Cimahi/Bandung dengan transparansi penuh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* COD Toko */}
            <div className="text-center space-y-6 group">
              <div className="mx-auto w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5 glowing-gold transition-all duration-500 group-hover:scale-105 group-hover:border-primary">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-xl text-white font-bold">COD Toko Fisik</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Kunjungi hub kami di Cimahi untuk inspeksi unit secara langsung. Transaksi aman, transparan, dan terpercaya.
                </p>
              </div>
            </div>

            {/* KYC Instant */}
            <div className="text-center space-y-6 group">
              <div className="mx-auto w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5 glowing-gold transition-all duration-500 group-hover:scale-105 group-hover:border-primary">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-xl text-white font-bold">KYC Instan</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Proses verifikasi data digital super cepat. Mulai sewa hanya dalam hitungan menit setelah data terverifikasi.
                </p>
              </div>
            </div>

            {/* No Deposit */}
            <div className="text-center space-y-6 group">
              <div className="mx-auto w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5 glowing-gold transition-all duration-500 group-hover:scale-105 group-hover:border-primary">
                <BadgeCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-xl text-white font-bold">Bebas Deposit</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Khusus warga dengan KTP Bandung & Cimahi, nikmati layanan sewa tanpa uang jaminan tambahan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className="font-mono text-xs text-primary hud-bracket uppercase tracking-widest">
            REVIEWS
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white font-display">
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
          <div className="lg:col-span-5 glass-card p-8 rounded-3xl flex flex-col justify-between space-y-8 border border-primary/10 bg-[#0e0e0d]/50">
            <div className="space-y-4">
              <span className="font-mono text-xs text-primary hud-bracket uppercase tracking-wider">
                KUNJUNGI GERAI KAMI
              </span>
              <h3 className="text-2xl font-bold font-display text-white">GadgetVault Cimahi</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Silakan datang langsung ke toko kami untuk mengambil unit sewa, melakukan cek fisik COD, atau mencairkan dana penjualan gadget Anda.
              </p>
            </div>

            <div className="space-y-4 border-t border-primary/10 pt-6 text-sm">
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Alamat Toko:</span>
                  <p className="text-text-secondary mt-1 leading-relaxed">{address}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Jam Operasional:</span>
                  <p className="text-text-secondary mt-1">{operatingHours}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-primary/10">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-primary hover:bg-primary-foreground hover:text-primary-foreground font-mono text-xs font-bold py-4 tracking-widest transition-all duration-300 rounded-none border border-primary text-[#070706] gold-hover"
              >
                TANYA JAWAB VIA WHATSAPP
              </a>
            </div>
          </div>

          {/* Maps Embed iframe */}
          <div className="lg:col-span-7 bg-[#0e0e0d] border border-primary/10 rounded-3xl overflow-hidden min-h-[350px] relative shadow-2xl">
            {settings?.googleMapsEmbed ? (
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
              />
            ) : (
              <iframe
                title="Peta Lokasi GadgetVault"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1980.5985871234125!2d107.5453!3d-6.8724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e4...!2sCimahi!5e0!3m2!1sid!2sid!4v1700000000000"
                className="w-full h-full border-0 absolute inset-0 opacity-80 grayscale invert contrast-125"
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
    <div className="glass-card p-8 rounded-2xl flex flex-col justify-between text-left space-y-6 border border-primary/10 bg-[#0e0e0d]/40">
      <p className="text-sm text-text-secondary italic leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex justify-between items-center pt-4 border-t border-primary/10">
        <div>
          <h4 className="font-bold text-white text-sm">{name}</h4>
          <span className="font-mono text-[10px] text-text-muted mt-1 block uppercase tracking-wider">{role}</span>
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
