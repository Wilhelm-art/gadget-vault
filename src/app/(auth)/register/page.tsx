"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().min(9, "Nomor telepon minimal 9 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  province: z.string().min(2, "Provinsi minimal 2 karakter"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      city: "",
      province: "",
    },
  });

  // Auto-detect location on mount using IP Lookup API
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.city) {
            setValue("city", data.city);
          }
          if (data.region) {
            setValue("province", data.region);
          }
          toast.info(`Lokasi terdeteksi otomatis: ${data.city || ""}, ${data.region || ""}`);
        }
      } catch (err) {
        console.log("Location detection skipped or blocked by adblocker");
      }
    };
    detectLocation();
  }, [setValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        toast.error(resData.message || "Registrasi gagal.");
      } else {
        toast.success("Registrasi berhasil! Silakan masuk.");
        router.push("/login");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Buat Akun Baru
        </h1>
        <p className="text-sm text-text-secondary">
          Daftar sekarang untuk mulai menjual, membeli, dan menyewa gadget.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">
            Nama Lengkap
          </label>
          <Input
            id="name"
            placeholder="John Doe"
            disabled={isLoading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-danger">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 karakter"
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">
            Nomor Telepon/WhatsApp
          </label>
          <Input
            id="phone"
            placeholder="08xxxxxxxxxx"
            disabled={isLoading}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-danger">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">
            Alamat Lengkap
          </label>
          <Input
            id="address"
            placeholder="Jl. Nama Jalan No. XX"
            disabled={isLoading}
            {...register("address")}
          />
          {errors.address && (
            <p className="text-xs text-danger">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase">
              Kota
            </label>
            <Input
              id="city"
              placeholder="Contoh: Bandung"
              disabled={isLoading}
              {...register("city")}
            />
            {errors.city && (
              <p className="text-xs text-danger">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase">
              Provinsi
            </label>
            <Input
              id="province"
              placeholder="Contoh: Jawa Barat"
              disabled={isLoading}
              {...register("province")}
            />
            {errors.province && (
              <p className="text-xs text-danger">{errors.province.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white py-2.5 rounded-lg shadow-md hover:from-accent-gold-hover hover:to-accent-gold transition-all duration-200 mt-2"
          disabled={isLoading}
        >
          {isLoading ? "Mendaftar..." : "Daftar Akun"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-text-secondary">Sudah punya akun? </span>
        <Link
          href="/login"
          className="font-medium text-accent-gold hover:text-accent-gold-hover hover:underline"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
