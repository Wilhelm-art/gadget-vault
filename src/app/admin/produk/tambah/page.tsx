import React from "react";
import prisma from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";

export default async function AdminAddProductPage() {
  // 1. Fetch categories
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Tambah Produk Baru</h1>
        <p className="text-sm text-text-secondary mt-1">
          Masukkan detail informasi, spesifikasi, dan foto produk yang ingin dijual atau disewakan.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
