import React, { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getCachedCategories } from "@/lib/queries";
import ProductCard from "@/components/product/product-card";
import Breadcrumb from "@/components/layout/breadcrumb";
import { connection } from "next/server";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      searchParams: {
        category: "",
        search: "",
      },
    },
  ],
};

export default async function PurchaseCatalogPage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb />

      <div className="mt-4 space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Beli Gadget Premium
          </h1>
          <p className="text-sm text-text-secondary">
            Katalog perangkat HP, Kamera, Drone, dan Aksesoris berkualitas untuk dibeli. Booking online, cek fisik langsung, dan bayar di toko offline.
          </p>
        </div>

        <Suspense fallback={<BeliPageSkeleton />}>
          <PurchaseCatalogContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function BeliPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Pills Skeleton */}
      <div className="flex flex-wrap justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 bg-slate-200 rounded-full" />
        ))}
      </div>
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="border border-border rounded-2xl p-4 space-y-4 h-96">
            <div className="aspect-square bg-slate-200 rounded-xl" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-6 bg-slate-200 rounded w-1/3 pt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function PurchaseCatalogContent({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
  }>;
}) {
  await connection();
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  const categorySlug = params.category || "";

  // 1. Fetch categories (Cached)
  const categories = await getCachedCategories();

  // 2. Build where clause
  const whereClause: any = {
    isSellable: true,
  };

  if (categorySlug) {
    whereClause.category = {
      slug: categorySlug,
    };
  }

  // 3. Fetch sellable products
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
    <div className="space-y-8">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        <LinkButton href="/beli" isActive={categorySlug === ""}>
          Semua
        </LinkButton>
        {categories.map((cat) => (
          <LinkButton
            key={cat.id}
            href={`/beli?category=${cat.slug}`}
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="text-lg font-medium text-text-primary mb-1">Belum Ada Perangkat</h3>
          <p className="text-sm text-text-secondary">
            Maaf, saat ini tidak ada perangkat beli yang tersedia dalam kategori ini. Silakan hubungi kami untuk info ketersediaan.
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
