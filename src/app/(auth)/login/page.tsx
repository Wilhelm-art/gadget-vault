"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toast.error("Email atau password salah.");
      } else {
        toast.success("Berhasil masuk!");
        router.refresh();
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Masuk ke Akun
        </h1>
        <p className="text-sm text-text-secondary">
          Masukkan email dan password untuk mengakses dashboard Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-text-secondary uppercase">
              Password
            </label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white py-2.5 rounded-lg shadow-md hover:from-accent-gold-hover hover:to-accent-gold transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? "Memuat..." : "Masuk"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-text-secondary">Belum punya akun? </span>
        <Link
          href="/register"
          className="font-medium text-accent-gold hover:text-accent-gold-hover hover:underline"
        >
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}
