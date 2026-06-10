import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
      className={`${inter.variable} ${playfairDisplay.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-sans">
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" richColors />
        <SpeedInsights />
      </body>
    </html>
  );
}
