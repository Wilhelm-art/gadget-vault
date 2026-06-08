import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: PageProps) {
  // Await params as required in Next.js 15
  const { id } = await params;

  // 1. Fetch product details
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      specs: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) {
    notFound();
  }

  // 2. Fetch categories
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Ubah Produk</h1>
        <p className="text-sm text-text-secondary mt-1">
          Ubah informasi dasar, harga, status ketersediaan, atau foto produk **{product.name}**.
        </p>
      </div>

      <ProductForm categories={categories} initialData={product} />
    </div>
  );
}
