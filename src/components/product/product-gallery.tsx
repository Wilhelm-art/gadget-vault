"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductImage {
  id: string;
  imageUrl: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImage = images[activeImageIndex] || { imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60" };

  return (
    <div className="space-y-4">
      {/* Main Large Image */}
      <div className="relative aspect-[4/3] w-full bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <Image
          src={activeImage.imageUrl}
          alt={`${name} - Image ${activeImageIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-border">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveImageIndex(idx)}
              className={`relative aspect-[4/3] w-20 shrink-0 bg-white border rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                activeImageIndex === idx
                  ? "border-accent-gold ring-2 ring-accent-gold/20"
                  : "border-border hover:border-text-secondary"
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
