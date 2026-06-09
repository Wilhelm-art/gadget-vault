import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getCachedProductBySlug, getCachedRelatedProducts } from "@/lib/queries";
import { auth } from "@/auth";
import Breadcrumb from "@/components/layout/breadcrumb";
import ProductGallery from "@/components/product/product-gallery";
import ProductDetailActions from "@/components/product/product-detail-actions";
import ProductCard from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      params: { slug: "sample-product" },
      searchParams: { search: "" },
      cookies: [],
      headers: [
        ["x-forwarded-proto", "https"],
        ["x-forwarded-host", "localhost:3000"],
      ],
    },
  ],
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let product;
  if (slug === "sample-product") {
    product = {
      name: "Sample Product",
      description: "Sample Description for validation",
    };
  } else {
    product = await getCachedProductBySlug(slug);
  }

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan",
    };
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | GadgetVault`,
      description: product.description.slice(0, 160),
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch product (Cached)
  let product: any;
  if (slug === "sample-product") {
    product = {
      id: "sample-product-id",
      categoryId: "sample-category-id",
      name: "Sample Product",
      slug: "sample-product",
      description: "This is a sample product description for build-time validation.",
      brand: "Sample Brand",
      model: "Sample Model",
      condition: "new",
      sellPrice: 1000000,
      rentPriceDaily: 50000,
      rentPriceWeekly: 300000,
      status: "ready",
      isFeatured: false,
      isRentable: true,
      isSellable: true,
      stockQuantity: 1,
      createdAt: new Date("2026-06-08T00:00:00Z"),
      updatedAt: new Date("2026-06-08T00:00:00Z"),
      images: [
        {
          id: "sample-img-id",
          productId: "sample-product-id",
          imageUrl: "https://ashybsgniidyprgrkxcn.supabase.co/storage/v1/object/public/products/sample.jpg",
          storagePath: "products/sample.jpg",
          sortOrder: 0,
          isPrimary: true
        }
      ],
      specs: [],
      category: {
        id: "sample-category-id",
        name: "Sample Category",
        slug: "sample-category"
      }
    };
  } else {
    product = await getCachedProductBySlug(slug);
  }

  if (!product) {
    notFound();
  }

  // 2. Fetch related products (Cached)
  const relatedProducts = await getCachedRelatedProducts(product.slug, product.categoryId);

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case "new":
        return "Baru";
      case "like_new":
        return "Mulus (Like New)";
      case "good":
        return "Sangat Bagus";
      case "fair":
        return "Bagus (Fair)";
      default:
        return cond;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-success text-white">Tersedia / Ready</Badge>;
      case "rented":
        return <Badge className="bg-warning text-white">Sedang Disewa</Badge>;
      case "sold":
        return <Badge className="bg-danger text-white">Telah Terjual (Sold)</Badge>;
      default:
        return <Badge className="bg-text-muted text-white">Tidak Tersedia</Badge>;
    }
  };

  const formatRupiah = (val: any) => {
    if (!val) return "-";
    const num = typeof val === "number" ? val : parseFloat(val);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
        {/* Column 1: Image Gallery */}
        <div>
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Column 2: Product Info & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-bg-tertiary text-text-primary px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="bg-accent-gold-light text-accent-gold-hover px-2.5 py-1 rounded-md font-semibold">
                Kondisi: {getConditionLabel(product.condition)}
              </span>
              {getStatusLabel(product.status)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {product.name}
            </h1>
            <p className="text-sm text-text-secondary">Model: {product.model}</p>
          </div>

          {/* Pricing Info */}
          <div className="bg-white p-5 rounded-2xl border border-border space-y-3 shadow-sm">
            {product.isRentable && product.rentPriceDaily && (
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <div className="text-sm text-text-secondary">Harga Sewa:</div>
                <div className="text-right">
                  <div className="font-price font-bold text-accent-gold text-2xl">
                    {formatRupiah(product.rentPriceDaily)} <span className="text-xs font-normal text-text-secondary">/ hari</span>
                  </div>
                  {product.rentPriceWeekly && (
                    <div className="text-[10px] text-text-muted mt-0.5">
                      Mingguan: {formatRupiah(product.rentPriceWeekly)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {product.isSellable && product.sellPrice && (
              <div className="flex justify-between items-center pt-2">
                <div className="text-sm text-text-secondary">Harga Beli (COD):</div>
                <div className="font-price font-bold text-text-primary text-xl">
                  {formatRupiah(product.sellPrice)}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Actions */}
          <Suspense fallback={<div className="h-28 bg-white border border-border rounded-2xl p-5 animate-pulse shadow-sm" />}>
            <ProductActionsWrapper
              productId={product.id}
              productSlug={product.slug}
              isRentable={product.isRentable}
              isSellable={product.isSellable}
              status={product.status}
            />
          </Suspense>
        </div>
      </div>

      {/* Row 3: Specifications & Description */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-border pt-12">
        {/* Description */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Deskripsi Produk</h2>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Specifications Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Spesifikasi Detail</h2>
          {product.specs.length === 0 ? (
            <p className="text-xs text-text-secondary">Tidak ada spesifikasi khusus.</p>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden bg-white">
              <table className="min-w-full divide-y divide-border text-xs">
                <tbody className="divide-y divide-border text-text-secondary">
                  {product.specs.map((spec: any) => (
                    <tr key={spec.id} className="hover:bg-bg-secondary transition-colors">
                      <td className="px-4 py-3 font-semibold text-text-primary bg-bg-secondary/40 w-1/3">
                        {spec.specKey}
                      </td>
                      <td className="px-4 py-3 whitespace-pre-wrap">{spec.specValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-border pt-12">
          <h2 className="text-xl font-bold tracking-tight text-text-primary mb-6">Produk Terkait</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel: any) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Structured SEO Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.images.map((img: any) => img.imageUrl),
            "description": product.description,
            "brand": {
              "@type": "Brand",
              "name": product.brand,
            },
            "model": product.model,
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "IDR",
              "lowPrice": product.rentPriceDaily ? Number(product.rentPriceDaily) : (product.sellPrice ? Number(product.sellPrice) : 0),
              "highPrice": product.sellPrice ? Number(product.sellPrice) : (product.rentPriceDaily ? Number(product.rentPriceDaily) : 0),
              "offerCount": product.sellPrice && product.rentPriceDaily ? 2 : 1,
              "offers": [
                ...(product.rentPriceDaily
                  ? [
                      {
                        "@type": "Offer",
                        "price": Number(product.rentPriceDaily),
                        "priceCurrency": "IDR",
                        "description": "Daily rental rate",
                        "availability": product.status === "ready" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                      },
                    ]
                  : []),
                ...(product.sellPrice
                  ? [
                      {
                        "@type": "Offer",
                        "price": Number(product.sellPrice),
                        "priceCurrency": "IDR",
                        "description": "Purchase price",
                        "availability": product.status === "ready" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                      },
                    ]
                  : []),
              ],
            },
          }),
        }}
      />
    </div>
  );
}

async function ProductActionsWrapper({
  productId,
  productSlug,
  isRentable,
  isSellable,
  status,
}: {
  productId: string;
  productSlug: string;
  isRentable: boolean;
  isSellable: boolean;
  status: string;
}) {
  let isLoggedIn = false;
  let initialInWishlist = false;

  if (productSlug !== "sample-product") {
    const session = await auth();
    isLoggedIn = !!session?.user;
    const userId = session?.user ? (session.user as any).id : null;

    if (isLoggedIn && userId) {
      const wish = await prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
      initialInWishlist = !!wish;
    }
  }

  return (
    <ProductDetailActions
      productId={productId}
      productSlug={productSlug}
      isRentable={isRentable}
      isSellable={isSellable}
      isLoggedIn={isLoggedIn}
      initialInWishlist={initialInWishlist}
      status={status}
    />
  );
}

