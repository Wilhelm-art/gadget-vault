import React, { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getCachedCategories } from "@/lib/queries";
import ProductCard from "@/components/product/product-card";
import ProductFilter from "@/components/product/product-filter";
import Breadcrumb from "@/components/layout/breadcrumb";
import { connection } from "next/server";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      searchParams: {
        search: "",
        category: "",
        condition: "",
        minPrice: "",
        maxPrice: "",
        sort: "latest",
      },
    },
  ],
};

export default async function CatalogPage({ searchParams }: PageProps) {
  // 1. Fetch categories for filtering (Cached)
  const categories = await getCachedCategories();
  const params = await searchParams;
  const filterKey = `${params.category || ""}-${params.condition || ""}-${params.minPrice || ""}-${params.maxPrice || ""}-${params.sort || ""}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb />
      
      <div className="flex flex-col md:flex-row gap-8 mt-4">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <ProductFilter categories={categories} key={filterKey} />
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1">
          <Suspense fallback={<CatalogGridSkeleton />}>
            <CatalogContent searchParams={searchParams} categories={categories} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function CatalogGridSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-6 bg-slate-200 rounded w-1/6" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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

async function CatalogContent({
  searchParams,
  categories,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
  categories: any[];
}) {
  await connection();
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  
  const search = params.search || "";
  const categorySlug = params.category || "";
  const condition = params.condition || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const sort = params.sort || "latest";

  // 2. Build where clause dynamically
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categorySlug) {
    whereClause.category = {
      slug: categorySlug,
    };
  }

  if (condition) {
    whereClause.condition = condition;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.sellPrice = {};
    if (minPrice !== undefined) whereClause.sellPrice.gte = minPrice;
    if (maxPrice !== undefined) whereClause.sellPrice.lte = maxPrice;
  }

  // 3. Build order clause
  let orderByClause: any = { createdAt: "desc" }; // default: latest
  if (sort === "price_asc") {
    orderByClause = { sellPrice: "asc" };
  } else if (sort === "price_desc") {
    orderByClause = { sellPrice: "desc" };
  }

  // 4. Query products
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {categorySlug 
              ? categories.find(c => c.slug === categorySlug)?.name 
              : "Semua Gadget"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Menampilkan {products.length} produk pilihan berkualitas.
          </p>
        </div>
        {search && (
          <div className="text-sm bg-accent-gold-light text-accent-gold-hover px-3 py-1.5 rounded-lg border border-accent-gold/15">
            Hasil pencarian: <span className="font-semibold">&ldquo;{search}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-2xl p-8">
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
          <h3 className="text-lg font-medium text-text-primary mb-1">Produk Tidak Ditemukan</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            Maaf, tidak ada produk yang cocok dengan kriteria filter atau kata pencarian Anda. Silakan reset filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

