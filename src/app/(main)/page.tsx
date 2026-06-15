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
    <div className="space-y-36 pb-24 bg-transparent text-[#1A1C1C] overflow-x-hidden font-sans paper-noise font-light">

      {/* ── 1. HERO SECTION ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden border-b border-[#E8E4DB] py-24 sm:py-32">
        {/* Animated & Interactive Premium Background */}
        <CinematicBackgroundLight />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-10 text-left animate-fade-in-up">
            {/* Category chip */}
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#745a27] uppercase bg-[#F5F0E6]/80 px-4 py-2 rounded-full border border-[#c9a96e]/20 backdrop-blur-sm">
              ✦ PREMIUM GADGET ECOSYSTEM
            </span>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-display font-medium text-[#1A1C1C] leading-[1.0] tracking-tight">
                Sewa, Beli &amp; Jual <br />
                <span className="text-[#745a27] font-semibold italic">Gadget Flagship</span> <br />
                di Cimahi &amp; Bandung
              </h1>
            </div>

            <p className="text-base sm:text-lg text-[#4d463a] max-w-xl font-light leading-relaxed">
              Koleksi terkurasi dari handphone flagship, kamera mirrorless profesional, drone sinematik, dan aksesoris berkualitas. KYC instan, COD toko fisik, bebas deposit.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/sewa"
                className="bg-[#745a27] hover:bg-[#5f491f] text-white font-sans text-xs font-semibold tracking-wider uppercase px-10 py-5 rounded-full transition-all duration-300 flex items-center gap-3 shadow-[0_4px_25px_rgba(116,90,39,0.12)] hover:shadow-[0_8px_30px_rgba(116,90,39,0.22)] hover:-translate-y-0.5"
              >
                Mulai Sewa Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/katalog"
                className="bg-white/80 text-[#1A1C1C] font-sans text-xs font-semibold tracking-wider uppercase px-10 py-5 rounded-full border border-[#E8E4DB] hover:border-[#745a27] hover:text-[#745a27] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 backdrop-blur-sm"
              >
                Jelajahi Katalog
              </Link>
              <Link
                href="/jual"
                className="text-xs font-bold tracking-wider uppercase px-6 py-5 text-[#4d463a] hover:text-[#745a27] transition-all duration-300 flex items-center gap-2 hover:translate-x-1.5"
              >
                <Tag className="w-4 h-4" />
                Jual Gadget
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-8 pt-6 border-t border-[#E8E4DB]/60 w-fit">
              {["KYC Instan", "Bebas Deposit*", "COD Toko Fisik", "100% Verified"].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-[10px] font-semibold tracking-wider uppercase text-[#7f7668]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Asymmetrical Overlapping Showcase Stack */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[520px] sm:h-[580px] w-full">
            {/* Decorative ambient glow */}
            <div className="absolute w-[360px] h-[360px] bg-[#c9a96e]/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Back Card: Mirrorless Camera (slightly rotated and offset) */}
            <div className="absolute w-[250px] h-[330px] bg-white/60 backdrop-blur-sm border border-[#E8E4DB] rounded-3xl shadow-[0_20px_50px_rgba(201,169,110,0.06)] paper-noise -rotate-6 -translate-x-12 -translate-y-8 opacity-70 hover:opacity-100 hover:scale-105 transition-all duration-500 z-10 flex flex-col justify-between p-5 group/back">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-[#7f7668] tracking-[0.15em] uppercase">Mirrorless</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
              </div>
              <div className="relative h-[150px] w-full my-3 flex items-center justify-center">
                <Image
                  alt="Sony A7IV"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6zz3eFrt6v2Tb4Jh8kCLTwi8Kv_wh-NFtu3C8KkMBq7zFBlJz0-t2zSfOGQ5eKavxGpiXMZaBdVwHrr8YhMevFnvrIi5uSFtvCN4VV5F_hWpnjX5eC-1tBwrFrLdfvLps0P1NzgFdPwRupKYgNDAlpAMJX91rfvpFfJhgkyzfJbVStdUZCYcNxKhNS8Dwh8sIKqE88bIxOH0_hg9AGcqofgdkErbp8V5DD6m4cQBAXk4EctdiE49snvgIznbjtfnSkLBQWmrWces"
                  fill
                  className="object-contain p-2 group-hover/back:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex justify-between items-end border-t border-[#E8E4DB]/40 pt-3">
                <div className="text-left">
                  <p className="text-[9px] text-[#7f7668] uppercase tracking-wider">Sony A7 IV</p>
                  <p className="font-display text-xs font-bold text-[#1A1C1C]">Body Only</p>
                </div>
                <p className="font-mono text-xs font-bold text-[#745a27]">Rp 320K/H</p>
              </div>
            </div>

            {/* Front Card: Flagship Smartphone (centered and rotated) */}
            <div className="absolute w-[270px] h-[350px] bg-white/95 border border-[#E8E4DB] shadow-[0_32px_80px_rgba(201,169,110,0.12),0_8px_32px_rgba(26,28,28,0.04)] rounded-3xl paper-noise rotate-3 translate-x-12 translate-y-12 hover:rotate-0 hover:scale-[1.03] transition-all duration-500 z-20 flex flex-col justify-between p-6 group/front">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-[#7f7668] tracking-[0.15em] uppercase">Flagship</span>
                <span className="text-[9px] font-bold tracking-[0.1em] text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">NEW</span>
              </div>
              <div className="relative h-[160px] w-full my-3 flex items-center justify-center">
                <Image
                  alt="iPhone 14 Pro Max"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6zz3eFrt6v2Tb4Jh8kCLTwi8Kv_wh-NFtu3C8KkMBq7zFBlJz0-t2zSfOGQ5eKavxGpiXMZaBdVwHrr8YhMevFnvrIi5uSFtvCN4VV5F_hWpnjX5eC-1tBwrFrLdfvLps0P1NzgFdPwRupKYgNDAlpAMJX91rfvpFfJhgkyzfJbVStdUZCYcNxKhNS8Dwh8sIKqE88bIxOH0_hg9AGcqofgdkErbp8V5DD6m4cQBAXk4EctdiE49snvgIznbjtfnSkLBQWmrWces"
                  fill
                  className="object-contain p-2 drop-shadow-[0_16px_32px_rgba(0,0,0,0.06)] group-hover/front:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex justify-between items-end border-t border-[#E8E4DB]/40 pt-3">
                <div className="text-left">
                  <p className="text-[9px] text-[#7f7668] uppercase tracking-wider">iPhone 14 Pro Max</p>
                  <p className="font-display text-xs font-bold text-[#1A1C1C]">256GB Deep Purple</p>
                </div>
                <p className="font-mono text-xs font-bold text-[#745a27]">Rp 145K/H</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CURATED COLLECTIONS BENTO ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#745a27] uppercase bg-[#F5F0E6]/80 px-4 py-1.5 rounded-full border border-[#c9a96e]/20">
              ✦ KOLEKSI KAMI
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-[#1A1C1C] font-display">
              Curated Collections
            </h2>
          </div>
          <Link
            href="/katalog"
            className="text-xs font-semibold text-[#4d463a] tracking-widest uppercase flex items-center gap-2 hover:text-[#745a27] transition-colors"
          >
            LIHAT SEMUA KATEGORI
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Smartphones — wide */}
          <Link href="/katalog?category=handphone" className="md:col-span-8 group cursor-pointer">
            <div className="h-80 rounded-3xl overflow-hidden relative border border-[#E8E4DB] shadow-[0_8px_30px_rgba(201,169,110,0.03)] hover:shadow-[0_20px_50px_rgba(201,169,110,0.1)] hover:border-[#c9a96e] hover:-translate-y-0.5 transition-all duration-500 bg-white/60 backdrop-blur-md paper-noise">
              <Image
                alt="Smartphones"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7d-vAJ9HaR3AZJr1Yh11KtITHQxS2eym2d0zz1kz6P4VNzUltwceGzuMGASuFzEaSY8P1qgdsaWEFOfrcIxr6-VoKF1iCyjh5Dost2Es9JvgHS2ZVL7lmLCiwl1uNoKnYlo4zK6pDimwtN9ysXPCNOiJAJU56ssaNcLaVxUMGb3dkV72BvRKVmmshE2EHFkKmO3MRYpF78cNp5wKYjToie682Dm3Nubn59kr0378k9fW3EzKknEx41Jg1wF_xV15h-WKduMLW_uA"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                className="object-cover opacity-60 group-hover:scale-[1.02] transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent z-0" />
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-2xl font-bold text-[#1A1C1C]">Smartphones</h3>
                  <span className="text-[9px] font-bold tracking-[0.1em] text-[#745a27] bg-[#F5F0E6] border border-[#c9a96e]/20 px-2.5 py-0.5 rounded-full uppercase">NEW</span>
                </div>
                <div>
                  <p className="text-sm text-[#4d463a] mb-4 max-w-sm leading-relaxed">
                    Mulai dari iPhone 15 Pro series hingga Samsung S24 Ultra. Dioptimalkan untuk produktivitas &amp; kreasi konten.
                  </p>
                  <span className="text-xs font-semibold text-[#745a27] tracking-wider uppercase flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Cameras — narrow */}
          <Link href="/katalog?category=kamera" className="md:col-span-4 group cursor-pointer">
            <div className="h-80 rounded-3xl overflow-hidden relative border border-[#E8E4DB] shadow-[0_8px_30px_rgba(201,169,110,0.03)] hover:shadow-[0_20px_50px_rgba(201,169,110,0.1)] hover:border-[#c9a96e] hover:-translate-y-0.5 transition-all duration-500 bg-white/60 backdrop-blur-md paper-noise">
              <Image
                alt="Cameras"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXu-UfNnGVmpF69QU9khyB7AyVhRAybBaggO7L2c1CV0gm3ZurE6ZUEBAo4dbyRhj82rJ8dOZHfHrTs1XnDVsbg-bMSeQh5sWkh8vIwZwRjhMlwdDOf178zkHYmnaAd7U1vDYI8f4x-Jwyqb8ahoXXBa5ePyk8Snl8-uDeraDtv96I0uB68Tw9sxy6jKFyWZmX58e6op-PPTaLhloKDQ6_yROYxkNXuIKdOkdjl5sfCFG6sZ1Py-CVX_P4qIaEl9UndqbzL4opGCgZg"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover opacity-60 group-hover:scale-[1.02] transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent z-0" />
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-2xl font-bold text-[#1A1C1C]">Cameras</h3>
                  <Camera className="w-5 h-5 text-[#745a27]" />
                </div>
                <div>
                  <p className="text-xs text-[#4d463a] mb-4 leading-relaxed">
                    Masterpiece dari Sony A7IV, Lumix S5IIX, &amp; Fujifilm.
                  </p>
                  <span className="text-xs font-semibold text-[#745a27] tracking-wider uppercase flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Jelajahi <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Drones — narrow */}
          <Link href="/katalog?category=drone" className="md:col-span-4 group cursor-pointer">
            <div className="h-80 rounded-3xl overflow-hidden relative border border-[#E8E4DB] shadow-[0_8px_30px_rgba(201,169,110,0.03)] hover:shadow-[0_20px_50px_rgba(201,169,110,0.1)] hover:border-[#c9a96e] hover:-translate-y-0.5 transition-all duration-500 bg-white/60 backdrop-blur-md paper-noise">
              <Image
                alt="Drones"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFqai6lOU6BIPLomupm4E_WRN53MWPBiTCWSrgqmjEdWOKFyLYCEg7_CHaaFw0w9xz9j1YF5mAow1MAy9a9-ZBFDCE_-Ai5cB-5NJmGOTMY9kWE6kbGJRfw7sTfk-EY5fXrcvM2cZTy3NmVotPePk0R116imysWJlmWlwoYidzuwes7aPbrR10F3S6AyVZ-OgpRM6b0ar6M3t-URQPTOOBSPsVKxQfwPq0ikkdclP7Umv-kQ-M8uMlxSee65W7g0tVcUHW9a_FMwc"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover opacity-60 group-hover:scale-[1.02] transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent z-0" />
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-2xl font-bold text-[#1A1C1C]">Drones</h3>
                  <Zap className="w-5 h-5 text-[#745a27]" />
                </div>
                <div>
                  <p className="text-xs text-[#4d463a] mb-4 leading-relaxed">
                    DJI Air 3, Mavic 3 Pro, dan FPV cinematic setup.
                  </p>
                  <span className="text-xs font-semibold text-[#745a27] tracking-wider uppercase flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Jelajahi <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Accessories — wide */}
          <Link href="/katalog?category=aksesoris" className="md:col-span-8 group cursor-pointer">
            <div className="h-80 rounded-3xl overflow-hidden relative border border-[#E8E4DB] shadow-[0_8px_30px_rgba(201,169,110,0.03)] hover:shadow-[0_20px_50px_rgba(201,169,110,0.1)] hover:border-[#c9a96e] hover:-translate-y-0.5 transition-all duration-500 bg-white/60 backdrop-blur-md paper-noise">
              <Image
                alt="Accessories"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgK-EZXG25JqJ6onx8pJpqalcu7JXrFHBcrmw0SDxqaOJ62ETwooN1I4dy25T6CCiNKFmZkW3iPiFdDLErHhaD93PVsbhBGG6psHFHIT4WHA_XbjH1LP251t9fFvR4JKNTXZzwuhtGOW8Myjd8SPupiU69aauhamAj4EVxrToc1PaDyl6H0HRVhVEsQSmdIgUJGldxb5Fr9G5wDHwJ2RghOfjsP9Eb_6ZIvPj2BRNq2r-djF8YB52vVlCybB591Esv6RA9kQtquuM"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                className="object-cover opacity-60 group-hover:scale-[1.02] transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent z-0" />
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-2xl font-bold text-[#1A1C1C]">Accessories</h3>
                  <Headphones className="w-5 h-5 text-[#745a27]" />
                </div>
                <div>
                  <p className="text-sm text-[#4d463a] mb-4 max-w-md leading-relaxed">
                    Gears esensial untuk mendukung kreativitas Anda. Tripod kokoh, mikrofon nirkabel, baterai cadangan, &amp; charger performa tinggi.
                  </p>
                  <span className="text-xs font-semibold text-[#745a27] tracking-wider uppercase flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
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
              <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#745a27] uppercase bg-[#F5F0E6]/80 px-4 py-1.5 rounded-full border border-[#c9a96e]/20 mb-3 block w-fit">
                ✦ REKOMENDASI TERBAIK
              </span>
              <h2 className="text-3xl font-medium tracking-tight text-[#1A1C1C] font-display">
                Featured Masterpieces
              </h2>
            </div>
            <Link
              href="/katalog"
              className="text-xs font-semibold tracking-wider uppercase text-[#745a27] hover:text-[#5f491f] flex items-center gap-1.5 transition-colors"
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
      <section className="relative py-28 bg-white/40 backdrop-blur-md border-y border-[#E8E4DB] overflow-hidden paper-noise">
        {/* Top gold line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a96e]/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-20">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#745a27] uppercase bg-[#F5F0E6]/80 px-4 py-1.5 rounded-full border border-[#c9a96e]/20">
              ✦ KEUNGGULAN LAYANAN
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-[#1A1C1C] font-display">
              Transaksi Penuh Kepercayaan
            </h2>
            <p className="text-sm text-[#4d463a] leading-relaxed">
              Layanan jual, beli, dan sewa gadget terbaik di Cimahi/Bandung dengan transparansi penuh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Store className="w-6 h-6 text-[#745a27]" />,
                title: "COD Toko Fisik",
                desc: "Kunjungi hub kami di Cimahi untuk inspeksi unit secara langsung. Transaksi aman, transparan, dan terpercaya."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-[#745a27]" />,
                title: "KYC Instan",
                desc: "Proses verifikasi data digital super cepat. Mulai sewa hanya dalam hitungan menit setelah data terverifikasi."
              },
              {
                icon: <BadgeCheck className="w-6 h-6 text-[#745a27]" />,
                title: "Bebas Deposit",
                desc: "Khusus warga dengan KTP Bandung & Cimahi, nikmati layanan sewa tanpa uang jaminan tambahan."
              }
            ].map((item) => (
              <div key={item.title} className="relative bg-white/50 backdrop-blur-sm p-8 sm:p-10 rounded-3xl border border-[#E8E4DB]/50 shadow-[0_8px_30px_rgba(201,169,110,0.03)] hover:shadow-[0_16px_40px_rgba(201,169,110,0.08)] hover:border-[#c9a96e]/60 transition-all duration-500 text-center space-y-6 group cursor-default overflow-hidden">
                {/* HUD Corner Brackets */}
                <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#c9a96e]/40 pointer-events-none group-hover:border-[#745a27] transition-colors duration-350" />
                <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#c9a96e]/40 pointer-events-none group-hover:border-[#745a27] transition-colors duration-350" />
                <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-[#c9a96e]/40 pointer-events-none group-hover:border-[#745a27] transition-colors duration-350" />
                <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-[#c9a96e]/40 pointer-events-none group-hover:border-[#745a27] transition-colors duration-350" />

                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-[#F5F0E6] border border-[#c9a96e]/20 glowing-gold transition-all duration-500 group-hover:scale-105 group-hover:bg-[#c9a96e]/15">
                  {item.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="font-display text-lg text-[#1A1C1C] font-bold">{item.title}</h3>
                  <p className="text-sm text-[#4d463a] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. TESTIMONIALS ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-20">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#745a27] uppercase bg-[#F5F0E6]/80 px-4 py-1.5 rounded-full border border-[#c9a96e]/20">
            ✦ ULASAN PELANGGAN
          </span>
          <h2 className="text-3xl font-medium tracking-tight text-[#1A1C1C] font-display">
            Ulasan Terkurasi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-sm border border-[#E8E4DB] p-8 sm:p-10 rounded-3xl flex flex-col justify-between space-y-8 shadow-[0_12px_40px_rgba(201,169,110,0.04)] paper-noise">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 bg-[#F5F0E6]/80 text-[#745a27] text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-[#c9a96e]/20">
                ✦ KUNJUNGI GERAI KAMI
              </span>
              <h3 className="text-2xl font-bold font-display text-[#1A1C1C]">GadgetVault Cimahi</h3>
              <p className="text-sm text-[#4d463a] leading-relaxed">
                Silakan datang langsung ke gerai fisik kami untuk mengambil unit sewa, melakukan inspeksi fisik COD, atau mencairkan dana penjualan gadget Anda secara instan.
              </p>
            </div>

            <div className="space-y-5 border-t border-[#E8E4DB]/50 pt-6 text-sm">
              <div className="flex gap-4 items-start">
                <MapPin className="w-5 h-5 text-[#745a27] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1A1C1C] text-xs uppercase tracking-wider">Alamat Toko:</span>
                  <p className="text-[#4d463a] mt-1 leading-relaxed">{address}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Clock className="w-5 h-5 text-[#745a27] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1A1C1C] text-xs uppercase tracking-wider">Jam Operasional:</span>
                  <p className="text-[#4d463a] mt-1 leading-relaxed">{operatingHours}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E4DB]/50">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-[#745a27] hover:bg-[#5f491f] text-white font-medium text-xs tracking-wider uppercase py-4 px-6 rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(116,90,39,0.12)] hover:shadow-[0_8px_30px_rgba(116,90,39,0.22)] hover:-translate-y-0.5"
              >
                Tanya via WhatsApp
              </a>
            </div>
          </div>

          {/* Maps embed */}
          <div className="lg:col-span-7 bg-[#FAFAF8] border border-[#E8E4DB] rounded-3xl overflow-hidden min-h-[380px] relative shadow-[0_12px_40px_rgba(201,169,110,0.04)]">
            {settings?.googleMapsEmbed ? (
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
              />
            ) : (
              <iframe
                title="Peta Lokasi GadgetVault"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1980.5985871234125!2d107.5453!3d-6.8724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e4...!2sCimahi!5e0!3m2!1sid!2sid!4v1700000000000"
                className="w-full h-full border-0 absolute inset-0 filter grayscale contrast-125 opacity-90 hover:grayscale-0 transition-all duration-700"
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
    <div className="border-l-2 border-[#745a27] pl-6 py-2 flex flex-col justify-between text-left space-y-6 hover:border-[#c9a96e] transition-colors duration-300">
      <p className="text-base text-[#4d463a] italic leading-relaxed font-sans font-light">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex justify-between items-center pt-2">
        <div>
          <h4 className="font-bold text-[#1A1C1C] text-xs font-sans uppercase tracking-wider">{name}</h4>
          <span className="text-[9px] text-[#7f7668] mt-0.5 block uppercase tracking-[0.1em] font-semibold">{role}</span>
        </div>
        <div className="flex text-[#c9a96e] gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-2.5 h-2.5 fill-current" />
          ))}
        </div>
      </div>
    </div>
  );
}
