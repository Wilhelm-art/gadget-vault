"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <span className="font-display text-2xl font-bold tracking-tight text-accent-gold">
              GadgetVault
            </span>
            <p className="text-sm text-text-secondary leading-relaxed">
              Platform terpercaya di Bandung & Cimahi untuk penyewaan, pembelian, dan tukar-tambah gadget premium dengan KYC aman dan pelayanan prima.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" className="text-text-secondary hover:text-accent-gold transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://facebook.com" className="text-text-secondary hover:text-accent-gold transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://youtube.com" className="text-text-secondary hover:text-accent-gold transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
              Layanan Kami
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/katalog" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
                  Katalog Gadget
                </Link>
              </li>
              <li>
                <Link href="/sewa" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
                  Sewa Perangkat
                </Link>
              </li>
              <li>
                <Link href="/jual" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
                  Jual / Tukar Tambah
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
                  FAQ & Syarat Sewa
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Contacts */}
          <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
              Hubungi Kami
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-accent-gold shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary leading-relaxed">
                  Jl. Muara Takus Raya Jl. Trowulan No.21A, Melong, Kec. Cimahi Sel., Kota Cimahi, Jawa Barat 40534
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent-gold shrink-0" />
                <span className="text-sm text-text-secondary">0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent-gold shrink-0" />
                <span className="text-sm text-text-secondary">info@gadgetvault.com</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
              Jam Operasional
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex justify-between border-b border-border/50 pb-1">
                <span>Senin - Jumat:</span>
                <span className="font-medium text-text-primary">09:00 - 20:00</span>
              </li>
              <li className="flex justify-between border-b border-border/50 pb-1">
                <span>Sabtu - Minggu:</span>
                <span className="font-medium text-text-primary">10:00 - 18:00</span>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-success text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-success/90 transition-colors shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat WhatsApp Toko
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            &copy; {currentYear} GadgetVault. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex space-x-6 text-xs text-text-muted">
            <Link href="/faq" className="hover:text-accent-gold transition-colors">Syarat & Ketentuan</Link>
            <Link href="/faq" className="hover:text-accent-gold transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
