"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFilterProps {
  categories: Category[];
}

export default function ProductFilter({ categories }: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get("condition") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");

    if (selectedCondition) params.set("condition", selectedCondition);
    else params.delete("condition");

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    params.set("sort", sort);
    
    router.push(`/katalog?${params.toString()}`);
  };

  const handleReset = () => {
    setSelectedCategory("");
    setSelectedCondition("");
    setMinPrice("");
    setMaxPrice("");
    setSort("latest");
    router.push("/katalog");
  };

  const conditions = [
    { label: "Baru", value: "new" },
    { label: "Seperti Baru", value: "like_new" },
    { label: "Bagus", value: "good" },
    { label: "Cukup", value: "fair" },
  ];

  return (
    <div className="space-y-6 bg-white p-5 rounded-2xl border border-border">
      <div>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Urutkan
        </h3>
        <select
          className="w-full bg-bg-secondary border border-border rounded-lg text-sm p-2.5 focus:border-accent-gold outline-none"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">Terbaru</option>
          <option value="price_asc">Harga Terendah</option>
          <option value="price_desc">Harga Tertinggi</option>
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Kategori
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === ""}
              onChange={() => setSelectedCategory("")}
              className="accent-accent-gold"
            />
            <span>Semua Kategori</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.slug}
                onChange={() => setSelectedCategory(cat.slug)}
                className="accent-accent-gold"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Kondisi
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="radio"
              name="condition"
              checked={selectedCondition === ""}
              onChange={() => setSelectedCondition("")}
              className="accent-accent-gold"
            />
            <span>Semua Kondisi</span>
          </label>
          {conditions.map((cond) => (
            <label key={cond.value} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="radio"
                name="condition"
                checked={selectedCondition === cond.value}
                onChange={() => setSelectedCondition(cond.value)}
                className="accent-accent-gold"
              />
              <span>{cond.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          Filter Harga (Jual)
        </h3>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min Rp"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="text-xs bg-bg-secondary"
          />
          <Input
            type="number"
            placeholder="Max Rp"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="text-xs bg-bg-secondary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        <Button onClick={applyFilters} className="w-full bg-accent-gold text-white hover:bg-accent-gold-hover">
          Terapkan Filter
        </Button>
        <Button variant="ghost" onClick={handleReset} className="w-full text-text-secondary hover:bg-bg-secondary">
          Reset All
        </Button>
      </div>
    </div>
  );
}
