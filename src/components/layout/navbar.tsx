"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, Heart, Bell, Menu, X, LogOut, User, Receipt, Shield, UserCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as { id?: string; role?: string; kycStatus?: string; image?: string | null; name?: string | null; email?: string | null } | undefined;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/katalog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/katalog");
    }
  };

  const navLinks = [
    { name: "Katalog", href: "/katalog" },
    { name: "Sewa", href: "/sewa" },
    { name: "Jual Gadget", href: "/jual" },
    { name: "Tentang Kami", href: "/tentang" },
    { name: "FAQ", href: "/faq" },
  ];

  const getKycBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success/10 text-success border-success/20 text-[10px] py-0 px-1.5">KYC Verified</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px] py-0 px-1.5">KYC Pending</Badge>;
      case "rejected":
        return <Badge className="bg-danger/10 text-danger border-danger/20 text-[10px] py-0 px-1.5">KYC Rejected</Badge>;
      default:
        return <Badge className="bg-text-muted/10 text-text-secondary border-border text-[10px] py-0 px-1.5">KYC Unverified</Badge>;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex shrink-0 items-center">
              <span className="font-display text-2xl font-bold tracking-tight text-accent-gold hover:text-accent-gold-hover transition-colors">
                GadgetVault
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent-gold ${
                    isActive ? "text-accent-gold" : "text-text-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative max-w-xs w-full">
            <Input
              type="search"
              placeholder="Cari gadget..."
              className="w-full pr-10 pl-4 py-1.5 bg-bg-secondary text-sm border-border focus:border-accent-gold focus:ring-accent-gold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-2.5 text-text-secondary hover:text-accent-gold">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Auth Section / Right side */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Wishlist Link (if logged in) */}
            {user && (
              <Link href="/wishlist" className="p-2 text-text-secondary hover:text-accent-gold transition-colors relative">
                <Heart className="h-5 w-5" />
              </Link>
            )}

            {/* Notifications Link (if logged in) */}
            {user && (
              <Link href="/notifikasi" className="p-2 text-text-secondary hover:text-accent-gold transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-gold animate-pulse" />
              </Link>
            )}

            {/* User Dropdown / Auth Buttons */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                {/* Avatar Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1 focus:outline-none cursor-pointer bg-transparent border-0 p-0"
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                >
                  <Avatar className="h-8 w-8 border border-border hover:border-accent-gold transition-colors">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-accent-gold-light text-accent-gold font-semibold uppercase text-xs">
                      {user.name ? user.name.charAt(0) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* Dropdown Panel */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-xl shadow-lg z-50 p-1 animate-in fade-in-0 zoom-in-95">
                    {/* User Info */}
                    <div className="px-3 py-2 flex flex-col gap-0.5">
                      <div className="font-semibold text-text-primary text-sm truncate">{user.name}</div>
                      <div className="text-xs text-text-secondary truncate mb-1">{user.email}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.role === "admin" && (
                          <Badge className="bg-accent-gold/10 text-accent-gold border-accent-gold/20 text-[9px] py-0 px-1">Admin</Badge>
                        )}
                        {getKycBadge(user.kycStatus || "unverified")}
                      </div>
                    </div>
                    <div className="h-px bg-border -mx-1 my-1" />

                    {/* Admin link */}
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-bg-secondary hover:text-accent-gold transition-colors"
                      >
                        <Shield className="h-4 w-4 text-accent-gold" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      href="/profil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-bg-secondary hover:text-accent-gold transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>Profil Saya</span>
                    </Link>

                    <Link
                      href="/transaksi"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-bg-secondary hover:text-accent-gold transition-colors"
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Riwayat Transaksi</span>
                    </Link>

                    <Link
                      href="/kyc"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-bg-secondary hover:text-accent-gold transition-colors"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Verifikasi KYC</span>
                    </Link>

                    <div className="h-px bg-border -mx-1 my-1" />

                    <button
                      type="button"
                      onClick={() => { setIsUserMenuOpen(false); signOut({ callbackUrl: "/login" }); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-danger/10 hover:text-danger text-text-secondary transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "text-text-secondary hover:text-accent-gold hover:bg-bg-secondary"
                  )}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white hover:from-accent-gold-hover hover:to-accent-gold shadow-sm px-4"
                  )}
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Hamburger menu */}
            <button
              className="p-2 text-text-secondary hover:text-accent-gold md:hidden focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4 animate-fade-in-up">
          {/* Search bar on mobile */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Input
              type="search"
              placeholder="Cari gadget..."
              className="w-full pr-10 pl-4 py-1.5 bg-bg-secondary border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-2.5 text-text-secondary">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Links */}
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-text-secondary hover:text-accent-gold transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full border-accent-gold text-accent-gold hover:bg-accent-gold-light"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "w-full bg-accent-gold text-white hover:bg-accent-gold-hover"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Daftar
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
