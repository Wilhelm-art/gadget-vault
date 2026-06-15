"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAFAF8] border-t border-[#E8E4DB] mt-auto relative overflow-hidden paper-noise">
      {/* Aesthetic top gold highlight line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-bold tracking-tight text-[#745a27] hover:text-[#c9a96e] transition-colors">
                GadgetVault
              </span>
            </Link>
            <p className="text-sm text-[#4d463a] leading-relaxed">
              Platform terpercaya di Bandung &amp; Cimahi untuk penyewaan, pembelian, dan tukar-tambah gadget premium dengan KYC aman dan pelayanan prima offline-first.
            </p>
            <div className="flex space-x-4 pt-1">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-[#745a27] transition-colors">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-[#745a27] transition-colors">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-text-secondary hover:text-[#745a27] transition-colors">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-[10px] font-bold text-[#1A1C1C] uppercase tracking-[0.15em] mb-4">
              Layanan Kami
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/katalog" className="text-sm text-[#4d463a] hover:text-[#745a27] transition-colors">
                  Katalog Gadget
                </Link>
              </li>
              <li>
                <Link href="/sewa" className="text-sm text-[#4d463a] hover:text-[#745a27] transition-colors">
                  Sewa Perangkat
                </Link>
              </li>
              <li>
                <Link href="/jual" className="text-sm text-[#4d463a] hover:text-[#745a27] transition-colors">
                  Jual / Tukar Tambah
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-[#4d463a] hover:text-[#745a27] transition-colors">
                  FAQ &amp; Syarat Sewa
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Contacts */}
          <div>
            <h3 className="text-[10px] font-bold text-[#1A1C1C] uppercase tracking-[0.15em] mb-4">
              Hubungi Kami
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-[#745a27] shrink-0 mt-0.5" />
                <span className="text-sm text-[#4d463a] leading-relaxed">
                  Jl. Citeureup No.99, Cimahi Utara, Kota Cimahi, Jawa Barat 40512
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#745a27] shrink-0" />
                <span className="text-sm text-[#4d463a]">0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#745a27] shrink-0" />
                <span className="text-sm text-[#4d463a]">info@gadgetvault.com</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-[10px] font-bold text-[#1A1C1C] uppercase tracking-[0.15em] mb-4">
              Jam Operasional
            </h3>
            <ul className="space-y-2 text-sm text-[#4d463a]">
              <li className="flex justify-between border-b border-[#E8E4DB]/55 pb-1">
                <span>Senin - Jumat:</span>
                <span className="font-semibold text-[#1A1C1C]">09:00 - 20:00</span>
              </li>
              <li className="flex justify-between border-b border-[#E8E4DB]/55 pb-1">
                <span>Sabtu - Minggu:</span>
                <span className="font-semibold text-[#1A1C1C]">10:00 - 18:00</span>
              </li>
              <li className="pt-3">
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#745a27] hover:bg-[#5f491f] text-white px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(116,90,39,0.12)] hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat WhatsApp Toko
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#E8E4DB]/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#7f7668]">
            &copy; {currentYear} GadgetVault. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex space-x-6 text-xs text-[#7f7668]">
            <Link href="/faq" className="hover:text-[#745a27] transition-colors">Syarat &amp; Ketentuan</Link>
            <Link href="/faq" className="hover:text-[#745a27] transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
