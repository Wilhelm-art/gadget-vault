import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Sans, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | GadgetVault",
    default: "GadgetVault | Jual, Beli & Sewa Gadget Premium",
  },
  description: "Platform jual, beli, dan sewa gadget premium (Handphone, Kamera, Drone, dan Aksesoris) di Bandung & Cimahi dengan sistem KYC terintegrasi dan deposit reservasi.",
  keywords: ["sewa kamera bandung", "sewa drone bandung", "jual hp bekas bandung", "gadgetvault", "sewa gadget bandung"],
  openGraph: {
    title: "GadgetVault | Jual, Beli & Sewa Gadget Premium",
    description: "Sewa, beli, atau jual gadget premium Anda di Bandung dengan mudah dan aman.",
    url: "https://gadgetvault.vercel.app",
    siteName: "GadgetVault",
    locale: "id_ID",
    type: "website",
  },
};

import Providers from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfairDisplay.variable} ${dmSans.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-sans">
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
