import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import Sidebar from "@/components/layout/sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary pb-16 md:pb-0">
      <Navbar />
      <div className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Sidebar type="user" />
            <main className="flex-1 animate-fade-in-up">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
      <MobileNav />
    </div>
  );
}
