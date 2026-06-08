"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  brand: z.string().min(1, "Merek wajib diisi"),
  model: z.string().min(1, "Model wajib diisi"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  condition: z.string().min(1, "Kondisi wajib diisi"),
  sellPrice: z.string().optional(),
  rentPriceDaily: z.string().optional(),
  rentPriceWeekly: z.string().optional(),
  status: z.string().default("ready"),
  stockQuantity: z.coerce.number().min(1, "Stok minimal 1"),
  isFeatured: z.boolean().default(false),
  isRentable: z.boolean().default(false),
  isSellable: z.boolean().default(false),
  categoryId: z.string().min(1, "Kategori wajib diisi"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  imageUrl: string;
  storagePath: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductSpec {
  specKey: string;
  specValue: string;
  sortOrder: number;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: any; // pre-fill data for editing
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const [images, setImages] = useState<ProductImage[]>(initialData?.images || []);
  const [specs, setSpecs] = useState<ProductSpec[]>(initialData?.specs || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      description: initialData?.description || "",
      condition: initialData?.condition || "new",
      sellPrice: initialData?.sellPrice ? String(initialData.sellPrice) : "",
      rentPriceDaily: initialData?.rentPriceDaily ? String(initialData.rentPriceDaily) : "",
      rentPriceWeekly: initialData?.rentPriceWeekly ? String(initialData.rentPriceWeekly) : "",
      status: initialData?.status || "ready",
      stockQuantity: initialData?.stockQuantity || 1,
      isFeatured: initialData?.isFeatured || false,
      isRentable: initialData?.isRentable || false,
      isSellable: initialData?.isSellable || false,
      categoryId: initialData?.categoryId || "",
    },
  });

  const watchIsRentable = watch("isRentable");
  const watchIsSellable = watch("isSellable");

  // Handle Dynamic Specs rows
  const addSpecRow = () => {
    setSpecs([...specs, { specKey: "", specValue: "", sortOrder: specs.length }]);
  };

  const removeSpecRow = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: "specKey" | "specValue", val: string) => {
    const updated = [...specs];
    updated[idx][field] = val;
    setSpecs(updated);
  };

  // Handle Multi Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const newImg: ProductImage = {
            imageUrl: data.imageUrl,
            storagePath: data.storagePath,
            isPrimary: images.length === 0 && i === 0, // set primary if first image
            sortOrder: images.length,
          };
          setImages((prev) => [...prev, newImg]);
        } else {
          toast.error(`Gagal mengunggah gambar ${file.name}`);
        }
      } catch (err) {
        toast.error("Terjadi kesalahan koneksi saat mengunggah.");
      }
    }
    setIsUploading(false);
  };

  const removeImage = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    // If we deleted the primary image, make the first one primary
    if (images[idx].isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const setPrimaryImage = (idx: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === idx,
    }));
    setImages(updated);
  };

  // Submit Handler
  const onSubmit = async (data: any) => {
    if (images.length === 0) {
      toast.error("Minimal harus mengunggah 1 gambar produk.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...data,
      images,
      specs: specs.filter((s) => s.specKey.trim() && s.specValue.trim()), // remove empty rows
    };

    try {
      const url = isEditMode ? `/api/products/${initialData.id}` : "/api/products";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok) {
        toast.success(isEditMode ? "Produk diperbarui!" : "Produk berhasil ditambahkan!");
        router.push("/admin/produk");
        router.refresh();
      } else {
        toast.error(resData.message || "Gagal menyimpan produk.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: General Info Fields */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-2">
                Informasi Dasar
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">Nama Produk</label>
                <Input placeholder="Contoh: Sony Alpha 7 IV" {...register("name")} disabled={isSubmitting} />
                {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Merek</label>
                  <Input placeholder="Contoh: Sony" {...register("brand")} disabled={isSubmitting} />
                  {errors.brand && <p className="text-xs text-danger">{errors.brand.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Model</label>
                  <Input placeholder="Contoh: A7 IV" {...register("model")} disabled={isSubmitting} />
                  {errors.model && <p className="text-xs text-danger">{errors.model.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Kategori</label>
                  <select
                    className="w-full bg-bg-secondary border border-border rounded-lg text-sm p-2.5 outline-none focus:border-accent-gold"
                    {...register("categoryId")}
                    disabled={isSubmitting}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Kondisi</label>
                  <select
                    className="w-full bg-bg-secondary border border-border rounded-lg text-sm p-2.5 outline-none focus:border-accent-gold"
                    {...register("condition")}
                    disabled={isSubmitting}
                  >
                    <option value="new">Baru</option>
                    <option value="like_new">Mulus (Like New)</option>
                    <option value="good">Sangat Bagus</option>
                    <option value="fair">Bagus (Fair)</option>
                  </select>
                  {errors.condition && <p className="text-xs text-danger">{errors.condition.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">Deskripsi Produk</label>
                <textarea
                  placeholder="Detail spesifikasi, deskripsi kondisi fisik, kelengkapan, dll..."
                  className="w-full min-h-[140px] bg-bg-secondary border border-border rounded-lg text-sm p-3 focus:border-accent-gold outline-none text-text-primary"
                  {...register("description")}
                  disabled={isSubmitting}
                />
                {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Specifications */}
          <Card className="bg-white border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">
                  Spesifikasi Teknikal
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addSpecRow} className="text-xs border-accent-gold text-accent-gold hover:bg-accent-gold-light">
                  <Plus className="h-3 w-3 mr-1" /> Add Row
                </Button>
              </div>

              {specs.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-4">Belum ada spesifikasi ditambahkan.</p>
              ) : (
                <div className="space-y-3">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Nama Spek (e.g. Layar)"
                        value={spec.specKey}
                        onChange={(e) => handleSpecChange(idx, "specKey", e.target.value)}
                        className="bg-bg-secondary flex-1"
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder="Nilai Spek (e.g. 6.7 inch)"
                        value={spec.specValue}
                        onChange={(e) => handleSpecChange(idx, "specValue", e.target.value)}
                        className="bg-bg-secondary flex-1"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeSpecRow(idx)}
                        className="text-danger hover:bg-danger/10 shrink-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Status, Pricing, Images */}
        <div className="space-y-6">
          {/* Status & Options */}
          <Card className="bg-white border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-2">
                Status & Fitur
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">Status Ketersediaan</label>
                <select
                  className="w-full bg-bg-secondary border border-border rounded-lg text-sm p-2.5 outline-none focus:border-accent-gold"
                  {...register("status")}
                  disabled={isSubmitting}
                >
                  <option value="ready">Tersedia (Ready)</option>
                  <option value="rented">Disewa</option>
                  <option value="sold">Sold Out</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Jumlah Stok</label>
                  <Input type="number" {...register("stockQuantity")} disabled={isSubmitting} />
                  {errors.stockQuantity && <p className="text-xs text-danger">{errors.stockQuantity.message}</p>}
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="isFeatured" className="accent-accent-gold" {...register("isFeatured")} />
                  <label htmlFor="isFeatured" className="text-xs font-semibold text-text-secondary uppercase cursor-pointer">
                    Unggulan (Featured)
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Config */}
          <Card className="bg-white border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-2">
                Konfigurasi Harga
              </h3>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase cursor-pointer">
                  <input type="checkbox" className="accent-accent-gold" {...register("isSellable")} />
                  <span>Dapat Dibeli</span>
                </label>
                {watchIsSellable && (
                  <Input type="number" placeholder="Harga Jual (Rp)" {...register("sellPrice")} disabled={isSubmitting} />
                )}

                <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase cursor-pointer pt-2 border-t border-border/60">
                  <input type="checkbox" className="accent-accent-gold" {...register("isRentable")} />
                  <span>Dapat Disewa</span>
                </label>
                {watchIsRentable && (
                  <div className="space-y-2">
                    <Input type="number" placeholder="Sewa Harian (Rp)" {...register("rentPriceDaily")} disabled={isSubmitting} />
                    <Input type="number" placeholder="Sewa Mingguan (Rp)" {...register("rentPriceWeekly")} disabled={isSubmitting} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Multi Image Upload Box */}
          <Card className="bg-white border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-2">
                Foto Produk
              </h3>

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 bg-bg-primary text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1.5 py-4">
                    <Loader2 className="h-6 w-6 text-accent-gold animate-spin" />
                    <span className="text-xs text-text-secondary">Mengunggah file...</span>
                  </div>
                ) : (
                  <>
                    <label className="cursor-pointer py-4 flex flex-col items-center gap-1">
                      <ImageIcon className="h-8 w-8 text-text-muted" />
                      <span className="text-xs text-text-secondary">Unggah beberapa gambar</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Uploaded Images List */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] border border-border rounded-lg overflow-hidden bg-bg-secondary group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.imageUrl} alt="preview" className="object-cover w-full h-full" />
                      
                      {/* Selection Panel Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setPrimaryImage(idx)}
                          className={`hover:bg-white/20 text-white rounded-lg ${img.isPrimary ? "bg-accent-gold hover:bg-accent-gold" : ""}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeImage(idx)}
                          className="hover:bg-white/20 text-white hover:text-danger rounded-lg"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {img.isPrimary && (
                        <div className="absolute bottom-1.5 left-1.5 bg-accent-gold text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          PRIMARY
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-border">
        <Button
          type="submit"
          className="bg-accent-gold hover:bg-accent-gold-hover text-white px-8 py-2.5 text-sm font-semibold rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : isEditMode ? "Perbarui Produk" : "Simpan Produk"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/produk")}
          disabled={isSubmitting}
          className="border-border text-text-secondary rounded-xl"
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
