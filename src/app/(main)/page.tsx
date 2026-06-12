import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Smartphone, Camera, ShieldCheck, Heart, 
  MapPin, Clock, ArrowRight, Star, BadgeCheck, Zap,
  Tag, Store, Headphones, ArrowUpRight
} from "lucide-react";
import { getCachedFeaturedProducts, getCachedStoreSettings } from "@/lib/queries";
import ProductCard from "@/components/product/product-card";
import CinematicBackgroundLight from "@/components/layout/cinematic-background-light";

export const metadata = {
  title: "GadgetVault — Jual, Beli & Sewa Gadget Cimahi Bandung",
  description: "Platform sewa, beli, dan jual gadget premium (HP, Kamera, Drone, Aksesoris) offline-first di Bandung & Cimahi. KYC instan & jaminan transparan.",
};

export default async function HomePage() {
  const featuredProducts = await getCachedFeaturedProducts();
  const settings = await getCachedStoreSettings();
  const address = settings?.address || "Jl. Citeureup No.99, Cimahi Utara, Kota Cimahi, Jawa Barat 40512";
  const whatsapp = settings?.whatsapp || "628123456789";
  const operatingHours = "Senin - Sabtu: 09.00 - 18.00 WIB";

  return (
    <div className="space-y-28 pb-24 bg-[#FAFAF8] text-[#1A1C1C] overflow-x-hidden font-sans paper-noise">

      {/* ── 1. HERO SECTION ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden border-b border-[#E8E4DB] py-20 sm:py-28">
        {/* Animated & Interactive Premium Background */}
        <CinematicBackgroundLight />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8 text-left animate-fade-in-up">
            {/* Category chip */}
            <span className="inline-flex items-center gap-2 bg-[#F5F0E6] text-[#745a27] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-[#c9a96e]/30">
              ✦ PREMIUM GADGET ECOSYSTEM
            </span>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-display font-bold text-[#1A1C1C] leading-[1.1] tracking-tight">
                Sewa, Beli &amp; Jual <br />
                <span className="text-[#c9a96e] italic font-semibold">Gadget Premium</span> <br />
                di Cimahi
              </h1>
            </div>

            <p className="text-base sm:text-lg text-[#4d463a] max-w-xl leading-relaxed">
              Dapatkan akses ke handphone flagship, kamera mirrorless profesional, drone sinematik, dan berbagai aksesoris berkualitas. Transaksi aman secara offline (COD toko), verifikasi KYC instan, bebas deposit untuk warga Bandung/Cimahi.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/sewa"
                className="bg-[#c9a96e] text-white font-sans text-sm font-semibold px-8 py-4 tracking-wide rounded-md hover:bg-[#b8944d] transition-all duration-300 flex items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Mulai Sewa Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/katalog"
                className="bg-white text-[#1A1C1C] font-sans text-sm font-semibold px-8 py-4 tracking-wide rounded-md border border-[#E8E4DB] hover:border-[#c9a96e] hover:text-[#745a27] transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Jelajahi Katalog
              </Link>
              <Link
                href="/jual"
                className="text-sm font-semibold px-6 py-4 tracking-wide text-[#4d463a] hover:text-[#c9a96e] transition-all duration-300 flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Jual Gadget Anda
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-[#E8E4DB]">
              {["KYC Instan", "Bebas Deposit*", "COD Toko Fisik", "100% Verified"].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-xs text-[#4d463a]">
                  <BadgeCheck className="w-4 h-4 text-[#c9a96e]" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Floating Product Card */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[500px] sm:h-[560px] w-full">
            {/* Decorative ambient glow */}
            <div className="absolute w-[320px] h-[320px] bg-[#c9a96e]/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="floating z-20 w-full max-w-[400px]">
              <div className="bg-white rounded-2xl border border-[#E8E4DB] shadow-[0_16px_60px_rgba(201,169,110,0.12),0_4px_16px_rgba(26,28,28,0.06)] overflow-hidden">
                {/* Card header */}
                <div className="bg-[#FAFAF8] px-6 py-4 flex justify-between items-center border-b border-[#E8E4DB]">
                  <div className="text-xs font-semibold text-[#4d463a] uppercase tracking-wider">
                    Unit Pilihan
                  </div>
                  <div className="gold-chip">TERSEDIA</div>
                </div>

                {/* Product image */}
                <div className="relative group flex justify-center bg-white h-[280px] sm:h-[320px] w-full">
                  <Image
                    alt="iPhone 14 Pro Max"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6zz3eFrt6v2Tb4Jh8kCLTwi8Kv_wh-NFtu3C8KkMBq7zFBlJz0-t2zSfOGQ5eKavxGpiXMZaBdVwHrr8YhMevFnvrIi5uSFtvCN4VV5F_hWpnjX5eC-1tBwrFrLdfvLps0P1NzgFdPwRupKYgNDAlpAMJX91rfvpFfJhgkyzfJbVStdUZCYcNxKhNS8Dwh8sIKqE88bIxOH0_hg9AGcqofgdkErbp8V5DD6m4cQBAXk4EctdiE49snvgIznbjtfnSkLBQWmrWces"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain px-8 py-6 drop-shadow-[0_12px_36px_rgba(0,0,0,0.12)] transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Card footer */}
                <div className="px-6 py-5 border-t border-[#E8E4DB] bg-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-[#7f7668] uppercase tracking-wider mb-1">iPhone 14 Pro Max</div>
                      <h3 className="font-display text-lg font-bold text-[#1A1C1C]">256GB · Deep Purple</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#7f7668] uppercase tracking-wide mb-0.5">Mulai dari</div>
                      <div className="font-mono text-base font-bold text-[#c9a96e]">Rp 145K/Hari</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CURATED COLLECTIONS BENTO ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 bg-[#F5F0E6] text-[#745a27] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-[#c9a96e]/30">
              KOLEKSI KAMI
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1C1C] font-display">
              Curated Collections
            </h2>
          </div>
          <Link
            href="/katalog"
            className="text-sm font-semibold text-[#4d463a] tracking-wider flex items-center gap-2 hover:text-[#c9a96e] transition-colors"
          >
            LIHAT SEMUA KATEGORI
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Smartphones — wide */}
          <Link href="/katalog?category=handphone" className="md:col-span-8 group cursor-pointer">
            <div className="h-80 rounded-2xl overflow-hidden relative border border-[#E8E4DB] shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white">
              <Image
                alt="Smartphones"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7d-vAJ9HaR3AZJr1Yh11KtITHQxS2eym2d0zz1kz6P4VNzUltwceGzuMGASuFzEaSY8P1qgdsaWEFOfrcIxr6-VoKF1iCyjh5Dost2Es9JvgHS2ZVL7lmLCiwl1uNoKnYlo4zK6pDimwtN9ysXPCNOiJAJU56ssaNcLaVxUMGb3dkV72BvRKVmmshE2EHFkKmO3MRYpF78cNp5wKYjToie682Dm3Nubn59kr0378k9fW3EzKknEx41Jg1wF_xV15h-WKduMLW_uA"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent z-0" />
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-2xl font-bold text-[#1A1C1C]">Smartphones</h3>
                  <span className="gold-chip">TERBARU</span>
                </div>
                <div>
                  <p className="text-sm text-[#4d463a] mb-4 max-w-sm leading-relaxed">
                    From iPhone 15 Pro series to Samsung S24 Ultra. Optimized for productivity and content creation.
                  </p>
                  <span className="text-sm font-semibold text-[#c9a96e] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Cameras — narrow */}
          <Link href="/katalog?category=kamera" className="md:col-span-4 group cursor-pointer">
            <div className="h-80 rounded-2xl overflow-hidden relative border border-[#E8E4DB] shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white">
              <Image
                alt="Cameras"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-UfNnGVmpF69QU9khyB7AyVhRAybBaggO7L2c1CV0gm3ZurE6ZUEBAo4dbyRhj82rJ8dOZHfHrTs1XnDVsbg-bMSeQh5sWkh8vIwZwRjhMlwdDOf178zkHYmnaAd7U1vDYI8f4x-Jwyqb8ahoXXBa5ePyk8Snl8-uDeraDtv96I0uB68Tw9sxy6jKFyWZmX58e6op-PPTaLhloKDQ6_yROYxkNXuIKdOkdjl5sfCFG6sZ1Py-CVX_P4qIaEl9UndqbzL4opGCgZg"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent z-0" />
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-2xl font-bold text-[#1A1C1C]">Cameras</h3>
                  <Camera className="w-5 h-5 text-[#c9a96e]" />
                </div>
                <div>
                  <p className="text-xs text-[#4d463a] mb-4 leading-relaxed">
                    Sony A7IV, Lumix S5IIX, &amp; FujiFilm masterpieces.
                  </p>
                  <span className="text-sm font-semibold text-[#c9a96e] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Drones — narrow */}
          <Link href="/katalog?category=drone" className="md:col-span-4 group cursor-pointer">
            <div className="h-80 rounded-2xl overflow-hidden relative border border-[#E8E4DB] shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white">
              <Image
                alt="Drones"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFqai6lOU6BIPLomupm4E_WRN53MWPBiTCWSrgqmjEdWOKFyLYCEg7_CHaaFw0w9xz9j1YF5mAow1MAy9a9-ZBFDCE_-Ai5cB-5NJmGOTMY9kWE6kbGJRfw7sTfk-EY5fXrcvM2cZTy3NmVotPePk0R116imysWJlmWlwoYidzuwes7aPbrR10F3S6AyVZ-OgpRM6b0ar6M3t-URQPTOOBSPsVKxQfwPq0ikkdclP7Umv-kQ-M8uMlxSee65W7g0tVcUHW9a_FMwc"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent z-0" />
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-2xl font-bold text-[#1A1C1C]">Drones</h3>
                  <Zap className="w-5 h-5 text-[#c9a96e]" />
                </div>
                <div>
                  <p className="text-xs text-[#4d463a] mb-4 leading-relaxed">
                    DJI Air 3, Mavic 3 Pro, and FPV drones.
                  </p>
                  <span className="text-sm font-semibold text-[#c9a96e] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Accessories — wide */}
          <Link href="/katalog?category=aksesoris" className="md:col-span-8 group cursor-pointer">
            <div className="h-80 rounded-2xl overflow-hidden relative border border-[#E8E4DB] shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white">
              <Image
                alt="Accessories"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgK-EZXG25JqJ6onx8pJpqalcu7JXrFHBcrmw0SDxqaOJ62ETwooN1I4dy25T6CCiNKFmZkW3iPiFdDLErHhaD93PVsbhBGG6psHFHIT4WHA_XbjH1LP251t9fFvR4JKNTXZzwuhtGOW8Myjd8SPupiU69aauhamAj4EVxrToc1PaDyl6H0HRVhVEsQSmdIgUJGldxb5Fr9G5wDHwJ2RghOfjsP9Eb_6ZIvPj2BRNq2r-djF8YB52vVlCybB591Esv6RA9kQtquuM"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent z-0" />
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-2xl font-bold text-[#1A1C1C]">Accessories</h3>
                  <Headphones className="w-5 h-5 text-[#c9a96e]" />
                </div>
                <div>
                  <p className="text-sm text-[#4d463a] mb-4 max-w-md leading-relaxed">
                    Essential gears for your digital lifestyle. Tripods, microphones, battery packs, and high-performance chargers.
                  </p>
                  <span className="text-sm font-semibold text-[#c9a96e] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS ── */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="inline-flex items-center gap-2 bg-[#F5F0E6] text-[#745a27] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-[#c9a96e]/30 mb-3 block w-fit">
                REKOMENDASI TERBAIK
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#1A1C1C] font-display">
                Unit Featured Terlaris
              </h2>
            </div>
            <Link
              href="/katalog"
              className="text-sm font-semibold text-[#c9a96e] hover:text-[#b8944d] flex items-center gap-1 tracking-wider transition-colors"
            >
              LIHAT SEMUA <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
            {featuredProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. VALUE PROPOSITION (USP) ── */}
      <section className="relative py-24 bg-white border-y border-[#E8E4DB] overflow-hidden">
        {/* Top gold line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a96e]/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <span className="inline-flex items-center gap-2 bg-[#F5F0E6] text-[#745a27] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-[#c9a96e]/30">
              KEUNGGULAN LAYANAN
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1C1C] font-display">
              Transaksi Penuh Kepercayaan
            </h2>
            <p className="text-sm text-[#4d463a] leading-relaxed">
              Layanan jual, beli, dan sewa gadget terbaik di Cimahi/Bandung dengan transparansi penuh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Store className="w-8 h-8 text-[#c9a96e]" />,
                title: "COD Toko Fisik",
                desc: "Kunjungi hub kami di Cimahi untuk inspeksi unit secara langsung. Transaksi aman, transparan, dan terpercaya."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-[#c9a96e]" />,
                title: "KYC Instan",
                desc: "Proses verifikasi data digital super cepat. Mulai sewa hanya dalam hitungan menit setelah data terverifikasi."
              },
              {
                icon: <BadgeCheck className="w-8 h-8 text-[#c9a96e]" />,
                title: "Bebas Deposit",
                desc: "Khusus warga dengan KTP Bandung & Cimahi, nikmati layanan sewa tanpa uang jaminan tambahan."
              }
            ].map((item) => (
              <div key={item.title} className="text-center space-y-6 group">
                <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-[#F5F0E6] border border-[#c9a96e]/30 glowing-gold transition-all duration-500 group-hover:scale-105 group-hover:bg-[#c9a96e]/10">
                  {item.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="font-display text-xl text-[#1A1C1C] font-bold">{item.title}</h3>
                  <p className="text-sm text-[#4d463a] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. TESTIMONIALS ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className="inline-flex items-center gap-2 bg-[#F5F0E6] text-[#745a27] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-[#c9a96e]/30">
            ULASAN PELANGGAN
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1C1C] font-display">
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

      {/* ── 6. STORE INFO & MAP ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Info panel */}
          <div className="lg:col-span-5 bg-white border border-[#E8E4DB] p-8 rounded-3xl flex flex-col justify-between space-y-8 shadow-sm">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 bg-[#F5F0E6] text-[#745a27] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-[#c9a96e]/30">
                KUNJUNGI GERAI KAMI
              </span>
              <h3 className="text-2xl font-bold font-display text-[#1A1C1C]">GadgetVault Cimahi</h3>
              <p className="text-sm text-[#4d463a] leading-relaxed">
                Silakan datang langsung ke toko kami untuk mengambil unit sewa, melakukan cek fisik COD, atau mencairkan dana penjualan gadget Anda.
              </p>
            </div>

            <div className="space-y-4 border-t border-[#E8E4DB] pt-6 text-sm">
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-[#c9a96e] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1A1C1C]">Alamat Toko:</span>
                  <p className="text-[#4d463a] mt-1 leading-relaxed">{address}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Clock className="w-5 h-5 text-[#c9a96e] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1A1C1C]">Jam Operasional:</span>
                  <p className="text-[#4d463a] mt-1">{operatingHours}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E4DB]">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-[#c9a96e] text-white font-sans text-sm font-semibold py-4 tracking-wide transition-all duration-300 rounded-lg hover:bg-[#b8944d] shadow-md hover:shadow-lg"
              >
                Tanya via WhatsApp
              </a>
            </div>
          </div>

          {/* Maps embed */}
          <div className="lg:col-span-7 bg-[#F3F3F4] border border-[#E8E4DB] rounded-3xl overflow-hidden min-h-[380px] relative shadow-sm">
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
    <div className="bg-white border border-[#E8E4DB] p-8 rounded-2xl flex flex-col justify-between text-left space-y-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <p className="text-sm text-[#4d463a] italic leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex justify-between items-center pt-4 border-t border-[#E8E4DB]">
        <div>
          <h4 className="font-bold text-[#1A1C1C] text-sm">{name}</h4>
          <span className="text-[10px] text-[#7f7668] mt-1 block uppercase tracking-wider">{role}</span>
        </div>
        <div className="flex text-[#c9a96e]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-current" />
          ))}
        </div>
      </div>
    </div>
  );
}
