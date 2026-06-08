"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, User, ShoppingBag } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Katalog", href: "/katalog", icon: Search },
    { name: "Sewa", href: "/sewa", icon: Calendar },
    { name: "Jual", href: "/jual", icon: ShoppingBag },
    { name: "Profil", href: "/profil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-border md:hidden shadow-lg px-4 flex items-center justify-around">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        const Icon = link.icon;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
              isActive ? "text-accent-gold" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-[10px] mt-0.5 font-medium">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
