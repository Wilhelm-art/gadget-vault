"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

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

  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [reflection, setReflection] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Dampen tilt range for subtle 3D response
    const rotationX = Math.max(-6, Math.min(6, (centerY - y) / 15));
    const rotationY = Math.max(-6, Math.min(6, (x - centerX) / 15));

    setRotation({ x: rotationX, y: rotationY });
    setReflection({ x, y });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 font-medium text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full backdrop-blur-md">
            Ready
          </Badge>
        );
      case "rented":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 font-medium text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full backdrop-blur-md">
            Disewa
          </Badge>
        );
      case "sold":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 font-medium text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full backdrop-blur-md">
            Sold
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-zinc-500/10 text-zinc-600 border border-zinc-500/20 hover:bg-zinc-500/20 font-medium text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full backdrop-blur-md">
            Service
          </Badge>
        );
      case "coming_soon":
        return (
          <Badge className="bg-sky-500/10 text-sky-600 border border-sky-500/20 hover:bg-sky-500/20 font-medium text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full backdrop-blur-md">
            Coming Soon
          </Badge>
        );
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
    <Link href={`/katalog/${product.slug}`} className="block h-full group">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transition: isHovered
            ? "transform 0.05s ease-out, box-shadow 0.3s ease, border-color 0.3s ease"
            : "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease, border-color 0.4s ease",
        }}
        className={`relative h-full rounded-2xl overflow-hidden glass-card paper-noise border border-[#E8E4DB] flex flex-col justify-between cursor-pointer ${
          isHovered
            ? "shadow-[0_16px_40px_rgba(201,169,110,0.12),0_4px_16px_rgba(26,28,28,0.06)] border-[#c9a96e]"
            : ""
        }`}
      >
        {/* Subtle dynamic glass reflection overlay */}
        {isHovered && (
          <div
            style={{
              background: `radial-gradient(circle 160px at ${reflection.x}px ${reflection.y}px, rgba(255, 255, 255, 0.18), transparent 80%)`,
            }}
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          />
        )}

        {/* Image Display */}
        <div className="relative aspect-[4/3] w-full bg-[#FAFAF8] overflow-hidden flex items-center justify-center p-4 border-b border-[#E8E4DB]/50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            priority={false}
          />
          <div className="absolute top-3 right-3 z-10">
            {getStatusBadge(product.status)}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 flex-grow flex flex-col justify-between gap-4 bg-white/50 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-text-secondary/80 font-semibold uppercase tracking-[0.08em]">
              <span>{product.brand}</span>
              <span className="text-[#c9a96e] font-bold">&bull;</span>
              <span className="text-[#745a27]">{getConditionLabel(product.condition)}</span>
            </div>
            
            <h3 className="font-display font-bold text-text-primary text-base line-clamp-2 leading-tight group-hover:text-[#745a27] transition-colors duration-300">
              {product.name}
            </h3>
          </div>

          <div className="border-t border-[#E8E4DB]/60 pt-3 flex flex-col gap-2 mt-auto">
            {product.isRentable && product.rentPriceDaily && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary/70 font-medium font-sans">Sewa harian</span>
                <span className="font-price font-bold text-[#745a27] text-sm tracking-tight">
                  {formatRupiah(product.rentPriceDaily)} <span className="text-[10px] font-normal text-text-secondary/60">/ hari</span>
                </span>
              </div>
            )}
            {product.isSellable && product.sellPrice && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary/70 font-medium font-sans">Harga beli</span>
                <span className="font-price font-bold text-text-primary text-sm tracking-tight">
                  {formatRupiah(product.sellPrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
