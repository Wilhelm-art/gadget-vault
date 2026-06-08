"use client";

import React, { useState } from "react";
import { Search, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import Breadcrumb from "@/components/layout/breadcrumb";

const FAQ_DATA = [
  // SEWA
  {
    category: "sewa",
    q: "Bagaimana cara melakukan penyewaan gadget di GadgetVault?",
    a: "Pilih gadget yang ingin disewa di menu katalog sewa, tentukan durasi tanggal sewa, selesaikan proses registrasi dan unggah berkas verifikasi identitas (KYC) Anda. Setelah disetujui admin, Anda bisa mengambil unit langsung di toko offline kami."
  },
  {
    category: "sewa",
    q: "Berapa lama batas minimal dan maksimal durasi sewa?",
    a: "Batas minimal sewa adalah 1 hari (24 jam) dan maksimal durasi sewa sebetulnya tidak terbatas selama ketersediaan unit masih ada. Tarif sewa harian dan mingguan sudah disesuaikan agar semakin hemat jika sewa durasi panjang."
  },
  {
    category: "sewa",
    q: "Apakah penyewaan gadget bisa dikirim ke rumah?",
    a: "Saat ini GadgetVault menerapkan sistem offline-first. Pelanggan wajib datang langsung ke gerai kami di Cimahi untuk melakukan serah-terima fisik, pengecekan fungsi unit bersama staf, dan penandatanganan berita acara."
  },
  {
    category: "sewa",
    q: "Apa yang terjadi jika saya terlambat mengembalikan gadget?",
    a: "Keterlambatan pengembalian unit dikenakan denda sebesar tarif sewa harian produk tersebut ditambah biaya penalti keterlambatan sebesar 50% dari tarif harian per hari keterlambatan."
  },
  // BELI
  {
    category: "beli",
    q: "Bagaimana cara membeli gadget bekas di katalog toko?",
    a: "Anda bisa meninjau unit yang bertanda 'Ready untuk Dijual' di katalog kami, lalu klik tombol 'Beli Sekarang'. Sistem akan membukukan pesanan Anda secara online. Anda wajib datang ke gerai kami maksimal dalam 2 hari kerja untuk melakukan cek fisik unit sebelum melakukan pembayaran tunai/debit di kasir."
  },
  {
    category: "beli",
    q: "Apakah produk bekas yang dijual bergaransi?",
    a: "Ya. Setiap gadget bekas yang kami jual memiliki garansi toko selama 7 hari kalender untuk kerusakan fungsi non-human error sejak unit diserahterimakan."
  },
  // JUAL
  {
    category: "jual",
    q: "Bagaimana cara menjual gadget saya ke GadgetVault?",
    a: "Masuk ke menu 'Jual Gadget Anda', isi formulir kondisi perangkat, tandai kelengkapan box aksesoris, serta unggah minimal 3 foto unit gadget Anda. Admin akan meninjau dan mengirimkan penawaran harga taksiran. Jika setuju, silakan bawa unit ke gerai kami untuk pencairan dana instan."
  },
  {
    category: "jual",
    q: "Bagaimana kriteria gadget bekas yang diterima toko?",
    a: "Kami menerima handphone flagship, kamera mirrorless, drone, dan aksesoris berkualitas. Perangkat harus orisinal, tidak diblokir (IMEI terdaftar resmi), bukan barang curian, dan masih menyala normal/berfungsi dasar."
  },
  // KYC
  {
    category: "kyc",
    q: "Apa itu verifikasi KYC dan mengapa itu wajib?",
    a: "KYC (Know Your Customer) adalah proses verifikasi identitas wajib sebelum Anda melakukan penyewaan gadget. Ini diperlukan untuk mencegah tindak kejahatan atau penggelapan unit sewa. Berkas Anda dijamin aman secara digital."
  },
  {
    category: "kyc",
    q: "Dokumen apa saja yang diperlukan untuk verifikasi KYC?",
    a: "Anda perlu mengunggah foto KTP depan, KTP belakang, foto selfie memegang KTP Anda secara jelas, serta memasukkan 16 digit nomor NIK KTP Anda secara akurat."
  },
  {
    category: "kyc",
    q: "Berapa lama proses persetujuan verifikasi KYC?",
    a: "Proses verifikasi dokumen KYC oleh tim admin kami memakan waktu maksimal 1x24 jam sejak berkas diunggah secara lengkap."
  },
  // PEMBAYARAN
  {
    category: "pembayaran",
    q: "Metode pembayaran apa saja yang didukung?",
    a: "Karena transaksi kami bersifat offline-first, pembayaran sisa tarif sewa dan transaksi beli dilakukan offline di kasir gerai kami menggunakan Tunai (Cash), Kartu Debit, atau Transfer Bank instan saat COD."
  },
  {
    category: "pembayaran",
    q: "Bagaimana sistem uang jaminan (deposit) bagi penyewa luar kota?",
    a: "Bagi penyewa di luar Kota Bandung dan Cimahi, wajib mentransfer uang jaminan sebesar persentase tertentu dari total sewa sebelum mengambil barang. Deposit ini akan di-refund 100% instan ke rekening Anda setelah unit dikembalikan utuh."
  },
  // UMUM
  {
    category: "umum",
    q: "Di mana lokasi gerai fisik GadgetVault?",
    a: "Toko kami beralamat di Jl. Citeureup No.99, Cimahi Utara, Kota Cimahi, Jawa Barat. Anda bisa melihat koordinat peta Google Maps di halaman Kontak / Tentang Kami."
  },
  {
    category: "umum",
    q: "Apakah data pribadi KTP saya aman di database?",
    a: "Sangat aman. Seluruh berkas KYC KTP disimpan di folder penyimpanan privat terenkripsi di Supabase Storage yang hanya bisa diakses oleh admin berwenang demi mematuhi hukum privasi data."
  }
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const filteredFaq = FAQ_DATA.filter((item) => {
    const matchesSearch = 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory =
      activeTab === "all" || item.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumb />

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary font-display">
          Pertanyaan Umum (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Temukan jawaban cepat seputar sistem sewa, pembelian, penaksiran harga jual, dan aturan jaminan deposit toko kami.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto rounded-xl overflow-hidden shadow-sm">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
          <Search className="w-4 h-4" />
        </span>
        <Input
          placeholder="Cari pertanyaan Anda di sini..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-xs rounded-xl border-border focus:ring-accent-gold"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-1.5 border-b border-border/60 pb-4">
        {["all", "sewa", "beli", "jual", "kyc", "pembayaran", "umum"].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveTab(cat);
              setOpenIndex(null);
            }}
            className={`px-4 py-2 rounded-full text-[11px] font-bold border transition-all uppercase tracking-wider ${
              activeTab === cat
                ? "bg-accent-gold text-white border-accent-gold shadow-sm"
                : "bg-white text-text-secondary border-border hover:border-text-secondary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {filteredFaq.length === 0 ? (
          <div className="text-center py-12 bg-white border border-border rounded-2xl p-6">
            <HelpCircle className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Pertanyaan tidak ditemukan. Silakan gunakan kata kunci lain.</p>
          </div>
        ) : (
          filteredFaq.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-border rounded-xl overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-4 flex justify-between items-center text-left text-xs sm:text-sm font-semibold text-text-primary hover:bg-bg-secondary/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-accent-gold shrink-0" />
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-text-secondary shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-secondary shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-text-secondary leading-relaxed border-t border-border/40 bg-bg-secondary/10 text-left">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
