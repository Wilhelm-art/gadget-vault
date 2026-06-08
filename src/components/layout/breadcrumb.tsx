"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((s) => s);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-text-secondary mb-6" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-accent-gold flex items-center gap-1 transition-colors">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const displayName = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {isLast ? (
              <span className="font-semibold text-text-primary truncate max-w-[120px] sm:max-w-xs">
                {displayName}
              </span>
            ) : (
              <Link href={href} className="hover:text-accent-gold transition-colors truncate max-w-[120px] sm:max-w-xs">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
