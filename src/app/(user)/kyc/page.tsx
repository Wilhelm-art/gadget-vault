"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const kycSchema = z.object({
  ktpNumber: z.string().length(16, "Nomor KTP harus tepat 16 digit"),
});

export default function KycPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [ktpFront, setKtpFront] = useState<File | null>(null);
  const [ktpBack, setKtpBack] = useState<File | null>(null);
  const [selfieKtp, setSelfieKtp] = useState<File | null>(null);
  
  const [ktpFrontPreview, setKtpFrontPreview] = useState<string>("");
  const [ktpBackPreview, setKtpBackPreview] = useState<string>("");
  const [selfieKtpPreview, setSelfieKtpPreview] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbKycStatus, setDbKycStatus] = useState<string>("unverified");
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      ktpNumber: "",
    },
  });

  // Fetch current KYC status from DB on mount
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const res = await fetch("/api/kyc");
        if (res.ok) {
          const data = await res.json();
          if (data.status) {
            setDbKycStatus(data.status);
            setRejectionReason(data.rejectionReason || "");
          }
        }
      } catch (err) {
        console.error("Gagal memuat status KYC", err);
      }
    };
    fetchKycStatus();
  }, [session]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar (JPEG/PNG).");
        return;
      }
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !ktpFront) {
      toast.error("Silakan unggah foto KTP depan.");
      return;
    }
    if (currentStep === 2 && !ktpBack) {
      toast.error("Silakan unggah foto KTP belakang.");
      return;
    }
    if (currentStep === 3 && !selfieKtp) {
      toast.error("Silakan unggah foto Selfie dengan KTP.");
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: { ktpNumber: string }) => {
    if (!ktpFront || !ktpBack || !selfieKtp) {
      toast.error("Semua dokumen wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("ktpNumber", data.ktpNumber);
    formData.append("ktpFront", ktpFront);
    formData.append("ktpBack", ktpBack);
    formData.append("selfieKtp", selfieKtp);

    try {
      const response = await fetch("/api/kyc", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success("Dokumen KYC berhasil dikirim!");
        setDbKycStatus("pending");
        // Update session token client-side
        await updateSession({ kycStatus: "pending" });
        router.refresh();
      } else {
        toast.error(resData.message || "Gagal mengunggah KYC.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi saat mengirim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. If KYC is verified
  if (dbKycStatus === "approved" || (session?.user as any)?.kycStatus === "verified") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-success/30 bg-white">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-4">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-text-primary">KYC Terverifikasi</CardTitle>
            <CardDescription className="text-sm mt-1">
              Akun Anda telah terverifikasi secara penuh. Anda sekarang dapat melakukan transaksi sewa gadget.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/katalog")} className="bg-accent-gold text-white hover:bg-accent-gold-hover">
              Jelajahi Katalog
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 2. If KYC is pending verification
  if (dbKycStatus === "pending") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in-up">
        <Card className="border-warning/30 bg-white shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning mb-4">
              <svg className="h-10 w-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-text-primary">KYC Sedang Ditinjau</CardTitle>
            <CardDescription className="text-sm mt-1">
              Dokumen identitas Anda sedang dalam proses peninjauan oleh Admin. Proses ini biasanya memakan waktu maksimal 1x24 jam.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-text-secondary text-sm">
            Kami akan mengirimkan notifikasi setelah dokumen selesai diverifikasi. Terima kasih atas kesabaran Anda.
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/")} className="border-accent-gold text-accent-gold hover:bg-accent-gold-light">
              Kembali ke Beranda
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 3. KYC Form Wizard (Unverified / Rejected)
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in-up">
      {dbKycStatus === "rejected" && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger flex flex-col gap-1">
          <span className="font-semibold">⚠️ Pengajuan KYC Sebelumnya Ditolak</span>
          <span>Alasan penolakan: {rejectionReason || "Dokumen tidak jelas atau tidak sesuai."}</span>
          <span className="text-xs mt-1 text-text-secondary">Silakan unggah dokumen yang valid untuk mengajukan ulang.</span>
        </div>
      )}

      <Card className="bg-white border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-text-primary">Verifikasi Identitas (KYC)</CardTitle>
          <CardDescription>
            Lengkapi data identitas Anda untuk dapat menyewa gadget di GadgetVault.
          </CardDescription>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6 px-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step
                        ? "bg-accent-gold text-white"
                        : "bg-bg-tertiary text-text-secondary"
                    }`}
                  >
                    {step}
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-text-secondary mt-1">
                    {step === 1 ? "KTP Depan" : step === 2 ? "KTP Belakang" : step === 3 ? "Selfie" : "Nomor KTP"}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                      currentStep > step ? "bg-accent-gold" : "bg-bg-tertiary"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="min-h-[250px] flex flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: KTP Front */}
              {currentStep === 1 && (
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-medium text-text-primary">1. Foto KTP Bagian Depan</h3>
                  <p className="text-xs text-text-secondary max-w-md mx-auto">
                    Pastikan foto KTP depan terlihat jelas, tidak buram, dan tidak terpotong cahaya.
                  </p>
                  
                  <div className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:border-accent-gold transition-colors bg-bg-primary min-h-[160px]">
                    {ktpFrontPreview ? (
                      <div className="relative w-full max-w-xs h-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ktpFrontPreview}
                          alt="KTP Depan"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        <p className="text-xs text-text-secondary">Pilih atau ambil foto KTP depan</p>
                      </div>
                    )}
                    <label className="mt-4 cursor-pointer">
                      <span className="bg-accent-gold hover:bg-accent-gold-hover text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                        {ktpFront ? "Ubah Foto" : "Pilih File"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setKtpFront, setKtpFrontPreview)}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: KTP Back */}
              {currentStep === 2 && (
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-medium text-text-primary">2. Foto KTP Bagian Belakang</h3>
                  <p className="text-xs text-text-secondary max-w-md mx-auto">
                    Unggah foto KTP bagian belakang (atau halaman info alamat lengkap Anda).
                  </p>
                  
                  <div className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:border-accent-gold transition-colors bg-bg-primary min-h-[160px]">
                    {ktpBackPreview ? (
                      <div className="relative w-full max-w-xs h-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ktpBackPreview}
                          alt="KTP Belakang"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        <p className="text-xs text-text-secondary">Pilih atau ambil foto KTP belakang</p>
                      </div>
                    )}
                    <label className="mt-4 cursor-pointer">
                      <span className="bg-accent-gold hover:bg-accent-gold-hover text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                        {ktpBack ? "Ubah Foto" : "Pilih File"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setKtpBack, setKtpBackPreview)}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Selfie + KTP */}
              {currentStep === 3 && (
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-medium text-text-primary">3. Foto Selfie Memegang KTP</h3>
                  <p className="text-xs text-text-secondary max-w-md mx-auto">
                    Pegang KTP Anda di dekat wajah. Pastikan wajah Anda dan tulisan di KTP terlihat jelas.
                  </p>
                  
                  <div className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:border-accent-gold transition-colors bg-bg-primary min-h-[160px]">
                    {selfieKtpPreview ? (
                      <div className="relative w-full max-w-xs h-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selfieKtpPreview}
                          alt="Selfie KTP"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-text-secondary">Pilih atau ambil foto selfie KTP</p>
                      </div>
                    )}
                    <label className="mt-4 cursor-pointer">
                      <span className="bg-accent-gold hover:bg-accent-gold-hover text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                        {selfieKtp ? "Ubah Foto" : "Pilih File"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setSelfieKtp, setSelfieKtpPreview)}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Step 4: KTP Number & Submit */}
              {currentStep === 4 && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-sm mx-auto text-center">
                  <h3 className="text-lg font-medium text-text-primary">4. Konfirmasi Data</h3>
                  <p className="text-xs text-text-secondary mb-4">
                    Masukkan nomor induk kependudukan (NIK/KTP) Anda dengan benar untuk verifikasi.
                  </p>
                  
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-text-secondary uppercase">
                      Nomor KTP (16 Digit)
                    </label>
                    <Input
                      id="ktpNumber"
                      placeholder="3201xxxxxxxxxxxx"
                      maxLength={16}
                      disabled={isSubmitting}
                      {...register("ktpNumber")}
                    />
                    {errors.ktpNumber && (
                      <p className="text-xs text-danger">{errors.ktpNumber.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white py-2.5 rounded-lg shadow-md hover:from-accent-gold-hover hover:to-accent-gold transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Mengirimkan..." : "Kirim Pengajuan KYC"}
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-border pt-4">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="text-text-secondary"
          >
            Kembali
          </Button>
          {currentStep < 4 ? (
            <Button onClick={nextStep} className="bg-accent-gold text-white hover:bg-accent-gold-hover">
              Lanjut
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
