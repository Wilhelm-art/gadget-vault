import React from "react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/product/product-card";
import Breadcrumb from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function RentalCatalogPage({ searchParams }: PageProps) {
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  const categorySlug = params.category || "";

  // 1. Fetch categories
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  // 2. Build where clause
  const whereClause: any = {
    isRentable: true,
  };

  if (categorySlug) {
    whereClause.category = {
      slug: categorySlug,
    };
  }

  // 3. Fetch rentable products
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb />

      <div className="mt-4 space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Sewa Gadget Premium
          </h1>
          <p className="text-sm text-text-secondary">
            Katalog perangkat HP, Kamera, Drone, dan Aksesoris untuk disewa. Booking online, verifikasi KYC instan, ambil di toko offline.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <LinkButton href="/sewa" isActive={categorySlug === ""}>
            Semua
          </LinkButton>
          {categories.map((cat) => (
            <LinkButton
              key={cat.id}
              href={`/sewa?category=${cat.slug}`}
              isActive={categorySlug === cat.slug}
            >
              {cat.name}
            </LinkButton>
          ))}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-2xl p-8 max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-text-muted mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-text-primary mb-1">Belum Ada Perangkat</h3>
            <p className="text-sm text-text-secondary">
              Maaf, saat ini tidak ada perangkat sewa yang tersedia dalam kategori ini. Silakan hubungi kami untuk info ketersediaan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LinkButton({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
        isActive
          ? "bg-accent-gold text-white border-accent-gold shadow-sm"
          : "bg-white text-text-secondary border-border hover:border-text-secondary"
      }`}
    >
      {children}
    </Link>
  );
}

import Link from "next/link";
