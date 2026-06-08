import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductImage {
  imageUrl: string;
  isPrimary: boolean;
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    condition: string;
    sellPrice: any;
    rentPriceDaily: any;
    status: string;
    isRentable: boolean;
    isSellable: boolean;
    images: ProductImage[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const imageUrl = primaryImage?.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60";

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
      case "coming_soon":
        return <Badge className="bg-info text-white">Coming Soon</Badge>;
      default:
        return null;
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
    <Link href={`/katalog/${product.slug}`}>
      <Card className="h-full bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-border cursor-pointer group rounded-2xl flex flex-col justify-between">
        <div className="relative aspect-[4/3] w-full bg-bg-secondary overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={false}
          />
          <div className="absolute top-3 right-3 z-10">
            {getStatusBadge(product.status)}
          </div>
        </div>

        <CardContent className="p-4 flex-grow flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <span>{product.brand}</span>
              <span>&bull;</span>
              <span className="text-accent-gold-hover">{getConditionLabel(product.condition)}</span>
            </div>
            <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-snug group-hover:text-accent-gold transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="border-t border-border/60 pt-3 flex flex-col gap-1.5 mt-auto">
            {product.isRentable && product.rentPriceDaily && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Sewa harian:</span>
                <span className="font-price font-bold text-accent-gold text-sm">
                  {formatRupiah(product.rentPriceDaily)} <span className="text-[10px] font-normal text-text-secondary">/ hari</span>
                </span>
              </div>
            )}
            {product.isSellable && product.sellPrice && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Harga beli:</span>
                <span className="font-price font-bold text-text-primary text-sm">
                  {formatRupiah(product.sellPrice)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
