import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCachedProductBySlug, getCachedStoreSettings } from "@/lib/queries";
import { auth } from "@/auth";
import Breadcrumb from "@/components/layout/breadcrumb";
import RentalForm from "@/components/rental/rental-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      params: { slug: "sample-product" },
      searchParams: { search: "" },
    },
  ],
};

export default async function RentalBookingPage({ params }: PageProps) {
  const { slug } = await params;

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

        <Suspense fallback={
          <div className="h-96 bg-white border border-border rounded-2xl p-8 animate-pulse shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-6 bg-bg-secondary rounded w-1/4" />
              <div className="h-10 bg-bg-secondary rounded" />
              <div className="h-10 bg-bg-secondary rounded" />
            </div>
            <div className="h-12 bg-bg-secondary rounded w-1/3 self-end" />
          </div>
        }>
          <RentalBookingContent slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}

async function RentalBookingContent({ slug }: { slug: string }) {
  let userCity = "";
  let userProvince = "";
  let isOutOfTown = false;
  let product: any;
  let bookedRanges: any[] = [];
  let settings: any;

  if (slug === "sample-product") {
    userCity = "Bandung";
    userProvince = "Jawa Barat";
    isOutOfTown = false;
    product = {
      id: "sample-product-id",
      categoryId: "sample-category-id",
      name: "Sample Product",
      slug: "sample-product",
      description: "Sample Description",
      brand: "Sample Brand",
      model: "Sample Model",
      condition: "new",
      sellPrice: 1000000,
      rentPriceDaily: 50000,
      rentPriceWeekly: 300000,
      status: "ready",
      isFeatured: false,
      isRentable: true,
      isSellable: true,
      stockQuantity: 1,
      createdAt: new Date("2026-06-08T00:00:00Z"),
      updatedAt: new Date("2026-06-08T00:00:00Z"),
      images: [
        { imageUrl: "https://ashybsgniidyprgrkxcn.supabase.co/storage/v1/object/public/products/sample.jpg" }
      ],
      specs: [],
      category: { id: "sample-category-id", name: "Sample Category", slug: "sample-category" }
    };
    settings = {
      id: "sample-settings-id",
      storeName: "Sample Store",
      address: "Sample Address",
      phone: "12345",
      whatsapp: "12345",
      email: "sample@email.com",
      googleMapsEmbed: "",
      depositPercentage: 0.20,
      bankName: "Sample Bank",
      bankAccountNumber: "123",
      bankAccountName: "Sample Name",
      operatingHours: {},
      updatedAt: new Date("2026-06-08T00:00:00Z")
    };
    bookedRanges = [];
  } else {
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

    // 3. Fetch product (Cached)
    product = await getCachedProductBySlug(slug);

    if (!product || !product.isRentable || product.status !== "ready") {
      notFound();
    }

    // 4. Fetch store settings (Cached)
    settings = await getCachedStoreSettings();
    if (!settings) {
      throw new Error("Store settings not initialized. Run seed script.");
    }

    // 5. Fetch booked date ranges for this product
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
    bookedRanges = activeRentals.map((r) => ({
      start: r.startDate.toISOString(),
      end: r.endDate.toISOString(),
    }));

    userCity = user.city || "";
    userProvince = user.province || "";
    
    // Detect out-of-town: if city is not Bandung or Cimahi
    isOutOfTown = !(
      userCity.toLowerCase().includes("bandung") ||
      userCity.toLowerCase().includes("cimahi")
    );
  }

  return (
    <RentalForm
      product={product}
      bookedRanges={bookedRanges}
      userLocation={{ city: userCity, province: userProvince, isOutOfTown }}
      settings={settings}
    />
  );
}

