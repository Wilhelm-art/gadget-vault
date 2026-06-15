import React, { Suspense } from "react";
import Link from "next/link";
import { Package, Plus, Edit, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminProductActions from "@/components/admin/admin-product-actions";
import { connection } from "next/server";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      searchParams: { search: "" },
      cookies: [],
      headers: [
        ["x-forwarded-proto", "https"],
        ["x-forwarded-host", "localhost:3000"],
        ["x-instant-validation", "true"],
      ],
    },
  ],
};

export default async function AdminProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Manajemen Produk</h1>
          <p className="text-sm text-text-secondary mt-1">
            Tambah, ubah, dan kelola katalog produk yang ditampilkan di website.
          </p>
        </div>
        <Link
          href="/admin/produk/tambah"
          className={buttonVariants({ className: "bg-accent-gold text-white hover:bg-accent-gold-hover gap-2" })}
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Link>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <AdminProductsContent />
      </Suspense>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-200 rounded" />
        ))}
      </div>
    </div>
  );
}

async function AdminProductsContent() {
  await connection();
  // 1. Fetch products with categories
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-success text-white">Ready</Badge>;
      case "rented":
        return <Badge className="bg-warning text-white">Disewa</Badge>;
      case "sold":
        return <Badge className="bg-danger text-white">Sold</Badge>;
      case "maintenance":
        return <Badge className="bg-text-muted text-white">Service</Badge>;
      default:
        return <Badge className="bg-info text-white">{status}</Badge>;
    }
  };

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
    <>
      {/* Products Table */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-2xl p-8">
          <Package className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-1">Belum Ada Produk</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto mb-4">
            Mulai tambahkan produk pertama Anda ke katalog dengan mengeklik tombol di bawah.
          </p>
          <Link
            href="/admin/produk/tambah"
            className={buttonVariants({ className: "bg-accent-gold text-white hover:bg-accent-gold-hover" })}
          >
            Tambah Produk
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-xs text-left">
              <thead className="bg-bg-secondary text-text-primary font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Kondisi</th>
                  <th className="px-6 py-4">Harga Beli</th>
                  <th className="px-6 py-4">Sewa Harian</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-secondary">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary max-w-xs truncate">
                      {product.name}
                    </td>
                    <td className="px-6 py-4">{product.category.name}</td>
                    <td className="px-6 py-4">{getConditionLabel(product.condition)}</td>
                    <td className="px-6 py-4">{formatRupiah(product.sellPrice)}</td>
                    <td className="px-6 py-4">
                      {product.rentPriceDaily ? `${formatRupiah(product.rentPriceDaily)}` : "-"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/produk/${product.id}/edit`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                            className: "hover:text-accent-gold cursor-pointer",
                          })}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <AdminProductActions productId={product.id} name={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

