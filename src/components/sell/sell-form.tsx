"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Smartphone, Camera, Upload, X, ChevronRight, ChevronLeft, 
  CheckCircle2, Info, FileText, Coins, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SellFormProps {
  categories: Category[];
}

const CONDITIONS = [
  { value: "like_new", label: "Mulus (Like New)", desc: "Hampir tidak ada bekas pemakaian, berfungsi 100%, body mulus." },
  { value: "good", label: "Sangat Bagus (Good)", desc: "Ada sedikit goresan halus bekas pemakaian wajar, berfungsi 100%." },
  { value: "fair", label: "Bagus (Fair)", desc: "Terdapat goresan terlihat, penyok kecil, atau lecet. Fungsi normal." },
  { value: "poor", label: "Kurang (Poor)", desc: "Banyak minus fisik, layar retak halus, atau ada fungsi penunjang bermasalah." }
];

const COMPLETENESS_OPTIONS = [
  "Box / Dus Asli",
  "Charger Original",
  "Kabel Data",
  "Earphone / Headphone",
  "Nota Pembelian Asli",
  "Kartu Garansi",
  "Aksesoris Tambahan"
];

export default function SellForm({ categories }: SellFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form States
  const [itemName, setItemName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCompleteness, setSelectedCompleteness] = useState<string[]>([]);
  const [customCompleteness, setCustomCompleteness] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  
  // Image Upload States
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Navigation handlers
  const nextStep = () => {
    if (step === 1 && (!itemName || !categoryId || !brand || !model)) {
      toast.error("Mohon lengkapi seluruh informasi dasar perangkat.");
      return;
    }
    if (step === 2 && (!condition || !description)) {
      toast.error("Mohon pilih kondisi dan berikan deskripsi detail.");
      return;
    }
    if (step === 3 && selectedCompleteness.length === 0 && !customCompleteness) {
      toast.error("Mohon pilih minimal satu kelengkapan perangkat.");
      return;
    }
    if (step === 4 && images.length < 3) {
      toast.error("Mohon unggah minimal 3 foto perangkat Anda.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = images.length + filesArray.length;

      if (totalImages > 10) {
        toast.error("Maksimal unggah 10 foto perangkat.");
        return;
      }

      const validFiles: File[] = [];
      const validPreviews: string[] = [];

      filesArray.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} melebihi batas 5MB.`);
          return;
        }
        if (!file.type.startsWith("image/")) {
          toast.error(`File ${file.name} bukan format gambar valid.`);
          return;
        }
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      });

      setImages((prev) => [...prev, ...validFiles]);
      setImagePreviews((prev) => [...prev, ...validPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Checkbox handling
  const toggleCompleteness = (item: string) => {
    setSelectedCompleteness((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("itemName", itemName);
      formData.append("categoryId", categoryId);
      formData.append("brand", brand);
      formData.append("model", model);
      formData.append("condition", condition);
      formData.append("description", description);

      // Join standard and custom completeness
      const allCompleteness = [...selectedCompleteness];
      if (customCompleteness.trim()) {
        allCompleteness.push(customCompleteness.trim());
      }
      formData.append("completeness", allCompleteness.join(", "));

      if (askingPrice) {
        formData.append("askingPrice", askingPrice);
      }

      images.forEach((img) => {
        formData.append("images", img);
      });

      const res = await fetch("/api/sell-offers", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitted(true); // Permanently lock the button
        toast.success("Penawaran jual gadget Anda berhasil diajukan!");
        router.push("/transaksi");
      } else {
        toast.error(data.message || "Gagal mengajukan penawaran.");
        setIsSubmitting(false); // Only re-enable on failure
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi ke server.");
      setIsSubmitting(false); // Only re-enable on failure
    }
  };

  const selectedCategoryName = categories.find(c => c.id === categoryId)?.name || "";
  const selectedConditionLabel = CONDITIONS.find(c => c.value === condition)?.label || "";

  return (
    <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => {
                  if (num < step) setStep(num);
                }}
                disabled={num >= step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  step === num
                    ? "bg-accent-gold text-white shadow-sm ring-4 ring-accent-gold-light"
                    : step > num
                    ? "bg-accent-gold-light text-accent-gold-hover border border-accent-gold-light"
                    : "bg-bg-secondary text-text-muted border border-border"
                }`}
              >
                {step > num ? <CheckCircle2 className="w-5 h-5 text-accent-gold" /> : num}
              </button>
              {num < 6 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                    step > num ? "bg-accent-gold" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {step === 1 && "Informasi Dasar Gadget"}
          {step === 2 && "Kondisi Fisik & Detail"}
          {step === 3 && "Kelengkapan Perangkat"}
          {step === 4 && "Unggah Foto Gadget"}
          {step === 5 && "Ekspektasi Harga"}
          {step === 6 && "Konfirmasi Penawaran"}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-accent-gold" /> Informasi Dasar Gadget
            </h2>
            <p className="text-xs text-text-secondary">
              Tentukan kategori, merk, tipe, dan nama perangkat yang ingin Anda jual ke toko kami.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Nama Gadget *</label>
                <Input
                  placeholder="Contoh: iPhone 13 Pro Max"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="rounded-xl border-border focus:ring-accent-gold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Kategori *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Merk / Brand *</label>
                <Input
                  placeholder="Contoh: Apple, Sony, DJI"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="rounded-xl border-border focus:ring-accent-gold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Tipe / Model *</label>
                <Input
                  placeholder="Contoh: Sierra Blue 256GB Dual SIM"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="rounded-xl border-border focus:ring-accent-gold"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Condition & Specs */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Award className="w-5 h-5 text-accent-gold" /> Kondisi Gadget & Penjelasan Detail
            </h2>
            <p className="text-xs text-text-secondary">
              Pilih deskripsi kondisi fisik yang paling sesuai untuk mempermudah taksiran awal admin.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {CONDITIONS.map((cond) => (
                <div
                  key={cond.value}
                  onClick={() => setCondition(cond.value)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 text-left ${
                    condition === cond.value
                      ? "border-accent-gold bg-accent-gold-light/40 shadow-sm"
                      : "border-border hover:border-text-secondary bg-white"
                  }`}
                >
                  <div className="font-semibold text-sm text-text-primary">{cond.label}</div>
                  <div className="text-[11px] text-text-secondary mt-1">{cond.desc}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 mt-4">
              <label className="text-xs font-semibold text-text-secondary">
                Deskripsi Detail & Minus Perangkat *
              </label>
              <textarea
                placeholder="Jelaskan kondisi baterai (BH %), fungsi kamera, goresan di layar, atau riwayat servis bila ada. Kejujuran deskripsi mempercepat proses persetujuan COD."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 3: Completeness */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-gold" /> Kelengkapan Paket Penjualan
            </h2>
            <p className="text-xs text-text-secondary">
              Beri tanda centang pada aksesoris dan kelengkapan box bawaan yang masih Anda simpan.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {COMPLETENESS_OPTIONS.map((item) => {
                const isChecked = selectedCompleteness.includes(item);
                return (
                  <div
                    key={item}
                    onClick={() => toggleCompleteness(item)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 text-center text-xs font-medium ${
                      isChecked
                        ? "bg-accent-gold text-white border-accent-gold shadow-sm"
                        : "bg-white text-text-secondary border-border hover:border-text-secondary"
                    }`}
                  >
                    {item}
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5 mt-4">
              <label className="text-xs font-semibold text-text-secondary">
                Kelengkapan Lainnya (Opsional)
              </label>
              <Input
                placeholder="Contoh: Casing Spigen, Lens Filter 67mm, Memory Card 64GB"
                value={customCompleteness}
                onChange={(e) => setCustomCompleteness(e.target.value)}
                className="rounded-xl border-border focus:ring-accent-gold"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Photo Uploads */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Upload className="w-5 h-5 text-accent-gold" /> Unggah Foto Perangkat (Min. 3 Foto)
            </h2>
            <p className="text-xs text-text-secondary">
              Upload foto perangkat Anda dari berbagai sudut (depan, belakang, samping, saat menyala) untuk validasi awal. Maksimal 10 foto, maks 5MB per file.
            </p>

            {/* Drag and drop field */}
            <div className="border-2 border-dashed border-border hover:border-accent-gold transition-colors duration-200 rounded-2xl p-6 text-center bg-bg-secondary relative cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-10 w-10 text-accent-gold mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-primary">
                Pilih atau Seret Foto di Sini
              </p>
              <p className="text-[11px] text-text-secondary mt-1">
                Format JPEG, PNG atau WEBP (Maksimal 10 File)
              </p>
            </div>

            {/* Upload counter indicator */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Total terunggah:</span>
              <span className={`font-bold ${images.length >= 3 ? "text-success" : "text-danger"}`}>
                {images.length} / 10 foto (Min. 3)
              </span>
            </div>

            {/* Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square border border-border rounded-xl overflow-hidden bg-bg-secondary group">
                    <img
                      src={preview}
                      alt={`preview-${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-center text-[9px] text-white py-0.5 font-bold">
                      Foto {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Pricing expectations */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Coins className="w-5 h-5 text-accent-gold" /> Ekspektasi Harga Jual (Opsional)
            </h2>
            <p className="text-xs text-text-secondary">
              Tuliskan harga yang Anda inginkan (ekspektasi) untuk gadget Anda. Admin akan menjadikannya referensi saat menaksir nilai beli toko kami.
            </p>

            <div className="space-y-1.5 max-w-sm mt-4">
              <label className="text-xs font-semibold text-text-secondary">Ekspektasi Harga (Rupiah)</label>
              <div className="relative rounded-xl overflow-hidden">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">
                  Rp
                </span>
                <Input
                  type="number"
                  placeholder="Contoh: 8500000"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  className="pl-10 rounded-xl border-border focus:ring-accent-gold text-sm font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 p-3 bg-accent-gold-light/40 border border-accent-gold-light rounded-xl text-xs text-text-secondary mt-4 leading-relaxed max-w-md">
              <Info className="h-4 w-4 shrink-0 text-accent-gold mt-0.5" />
              <span>
                <strong>Taksiran Admin:</strong> Nilai beli final didasarkan pada harga pasar saat ini, tingkat kemulusan fisik, kesehatan komponen, serta kelengkapan box aksesoris.
              </span>
            </div>
          </div>
        )}

        {/* STEP 6: Summary & Submit */}
        {step === 6 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-gold" /> Ringkasan Pengajuan Jual
            </h2>
            <p className="text-xs text-text-secondary">
              Harap tinjau kembali data perangkat Anda sebelum mengirim penawaran ke admin toko.
            </p>

            <div className="border border-border rounded-2xl overflow-hidden bg-bg-secondary/40 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
                <div className="space-y-2">
                  <div>
                    <span className="text-text-muted">Nama Perangkat:</span>
                    <p className="font-bold text-text-primary text-sm mt-0.5">{itemName}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Kategori / Brand:</span>
                    <p className="font-semibold text-text-primary mt-0.5">
                      {selectedCategoryName} · {brand}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted">Tipe / Model:</span>
                    <p className="font-semibold text-text-primary mt-0.5">{model}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-text-muted">Kondisi Fisik:</span>
                    <p className="font-semibold text-text-primary mt-0.5">
                      <Badge className="bg-accent-gold-light text-accent-gold-hover border-accent-gold-light font-bold">
                        {selectedConditionLabel}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted">Aksesoris & Kelengkapan:</span>
                    <p className="font-semibold text-text-primary mt-0.5">
                      {[...selectedCompleteness, customCompleteness].filter(Boolean).join(", ") || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted">Harga yang Diharapkan:</span>
                    <p className="font-bold text-text-primary text-sm mt-0.5">
                      {askingPrice
                        ? new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(parseFloat(askingPrice))
                        : "Tidak diisi"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-5 bg-white space-y-2">
                <div className="font-semibold text-text-primary">Deskripsi Fisik & Minus:</div>
                <p className="text-text-secondary leading-relaxed bg-bg-secondary p-3 rounded-xl whitespace-pre-line text-[11px]">
                  {description}
                </p>
              </div>

              <div className="border-t border-border p-5 bg-white flex flex-wrap gap-2">
                <div className="font-semibold text-text-primary w-full mb-1">Foto diunggah ({images.length}):</div>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-bg-secondary">
                    <img src={preview} alt="summary-preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-danger/5 border border-danger/10 rounded-xl text-[11px] text-danger leading-relaxed">
              <strong>⚠️ Deklarasi Pelanggan:</strong> Dengan menekan tombol &quot;Kirim Penawaran Jual&quot;, Anda menyatakan bahwa perangkat adalah milik sah Anda (bukan barang curian/blokir), dan deskripsi kondisi fisik yang diberikan sesuai dengan keadaan aslinya. Pelanggan wajib membawa kartu identitas diri yang sah saat proses serah terima offline di toko.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-border mt-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="border-border text-text-secondary px-5 py-5 rounded-xl hover:bg-bg-secondary text-xs font-semibold gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-accent-gold text-white hover:bg-accent-gold-hover px-5 py-5 rounded-xl text-xs font-semibold gap-1 ml-auto"
            >
              Lanjutkan <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || isSubmitted}
              className="bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white hover:from-accent-gold-hover hover:to-accent-gold px-6 py-5 rounded-xl text-xs font-bold shadow-md ml-auto gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitted ? "✓ Penawaran Terkirim" : isSubmitting ? "Mengirim..." : "Kirim Penawaran Jual"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
