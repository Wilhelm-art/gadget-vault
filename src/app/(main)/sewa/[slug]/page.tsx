import React from "react";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Breadcrumb from "@/components/layout/breadcrumb";
import RentalForm from "@/components/rental/rental-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RentalBookingPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Authenticate user
  const session = await auth();
  if (!session || !session.user) {
    redirect(`/login?callbackUrl=/sewa/${slug}`);
  }

  const userId = (session.user as any).id;

  // 2. Fetch user profile to check KYC status and address (city)
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  // KYC guard: redirect to /kyc if not verified
  if (user.kycStatus !== "verified") {
    redirect(`/kyc?notice=kyc_required&returnUrl=/sewa/${slug}`);
  }

  // 3. Fetch product
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || !product.isRentable || product.status !== "ready") {
    notFound();
  }

  // 4. Fetch store settings (for deposit percentage & bank info)
  const settings = await prisma.storeSettings.findFirst();
  if (!settings) {
    throw new Error("Store settings not initialized. Run seed script.");
  }

  // 5. Fetch booked date ranges for this product
  // Any active rental (status not cancelled, completed)
  const activeRentals = await prisma.rentalTransaction.findMany({
    where: {
      productId: product.id,
      status: {
        in: ["pending", "approved", "picked_up", "returned"],
      },
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  // Convert dates to ISO strings to pass to client component
  const bookedRanges = activeRentals.map((r) => ({
    start: r.startDate.toISOString(),
    end: r.endDate.toISOString(),
  }));

  const userCity = user.city || "";
  const userProvince = user.province || "";
  
  // Detect out-of-town: if city is not Bandung or Cimahi
  const isOutOfTown = !(
    userCity.toLowerCase().includes("bandung") ||
    userCity.toLowerCase().includes("cimahi")
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb />

      <div className="space-y-6 mt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Reservasi Sewa Gadget
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Isi tanggal durasi sewa, periksa nominal jaminan (bila ada), dan kirim reservasi sewa Anda.
          </p>
        </div>

        <RentalForm
          product={product}
          bookedRanges={bookedRanges}
          userLocation={{ city: userCity, province: userProvince, isOutOfTown }}
          settings={settings}
        />
      </div>
    </div>
  );
}
