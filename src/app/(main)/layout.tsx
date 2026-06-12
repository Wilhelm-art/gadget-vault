import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import ScrollParallaxBackground from "@/components/layout/scroll-parallax-background";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent pb-16 md:pb-0 relative">
      <ScrollParallaxBackground />
      <Navbar />
      <main className="flex-grow relative z-[1]">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
