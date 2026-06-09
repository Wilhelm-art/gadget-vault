import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/layout/breadcrumb";
import TransactionDetailClient from "@/components/transaction/transaction-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export const metadata = {
  title: "Detail Transaksi",
  description: "Rincian detail transaksi, status deposit jaminan sewa, dan riwayat progress transaksi di GadgetVault.",
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      params: { id: "sample-transaction-id" },
      searchParams: { search: "" },
    },
  ],
};

export default async function TransactionDetailPage({
  params,
  searchParams,
}: PageProps) {
  return (
    <div className="space-y-6">
      <Breadcrumb />

      <Suspense
        fallback={
          <div className="h-96 bg-white border border-border rounded-2xl p-8 animate-pulse shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-6 bg-bg-secondary rounded w-1/4" />
              <div className="h-10 bg-bg-secondary rounded" />
              <div className="h-10 bg-bg-secondary rounded" />
            </div>
            <div className="h-12 bg-bg-secondary rounded w-1/3 self-end" />
          </div>
        }
      >
        <TransactionDetailContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function TransactionDetailContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  let transactionData: any = null;
  let resolvedType: "sewa" | "beli" | "jual" = "sewa";
  let storeSettings: any = null;

  if (id === "sample-transaction-id") {
    transactionData = {
      id: "sample-transaction-id",
      transactionCode: "TRX-SAMPLE",
      userId: "sample-user-id",
      productId: "sample-product-id",
      amount: 1000000,
      status: "pending",
      paymentMethod: "transfer",
      createdAt: new Date("2026-06-08T00:00:00Z"),
      product: {
        id: "sample-product-id",
        name: "Sample Product",
        images: [
          { imageUrl: "https://ashybsgniidyprgrkxcn.supabase.co/storage/v1/object/public/products/sample.jpg" }
        ]
      }
    };
    resolvedType = "beli";
    storeSettings = {
      bankName: "Sample Bank",
      bankAccountNumber: "123",
      bankAccountName: "Sample Account",
    };
  } else {
    const session = await auth();
    if (!session || !session.user) {
      redirect("/login");
    }

    const pSearchParams = await searchParams;
    const type = pSearchParams.type as "sewa" | "beli" | "jual" | undefined;
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Fetch the store settings for bank accounts & addresses
    storeSettings = await prisma.storeSettings.findFirst();
    if (!storeSettings) {
      throw new Error("Store settings are not initialized. Run the database seed script.");
    }

    // 1. Fetch transaction based on type, or try finding it if type is not provided
    if (type === "sewa") {
      transactionData = await prisma.rentalTransaction.findUnique({
        where: { id },
        include: {
          product: { include: { images: true } },
          deposit: true,
        },
      });
      resolvedType = "sewa";
    } else if (type === "beli") {
      transactionData = await prisma.purchaseTransaction.findUnique({
        where: { id },
        include: {
          product: { include: { images: true } },
        },
      });
      resolvedType = "beli";
    } else if (type === "jual") {
      transactionData = await prisma.sellOffer.findUnique({
        where: { id },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: true,
        },
      });
      resolvedType = "jual";
    } else {
      // If type is not passed, check sequentially in database
      const rentalCheck = await prisma.rentalTransaction.findUnique({
        where: { id },
        include: {
          product: { include: { images: true } },
          deposit: true,
        },
      });

      if (rentalCheck) {
        transactionData = rentalCheck;
        resolvedType = "sewa";
      } else {
        const purchaseCheck = await prisma.purchaseTransaction.findUnique({
          where: { id },
          include: {
            product: { include: { images: true } },
          },
        });

        if (purchaseCheck) {
          transactionData = purchaseCheck;
          resolvedType = "beli";
        } else {
          const sellCheck = await prisma.sellOffer.findUnique({
            where: { id },
            include: {
              images: { orderBy: { sortOrder: "asc" } },
              category: true,
            },
          });

          if (sellCheck) {
            transactionData = sellCheck;
            resolvedType = "jual";
          }
        }
      }
    }

    if (!transactionData) {
      notFound();
    }

    // Access control check: only the creator of transaction or admin can view
    if (transactionData.userId !== userId && role !== "admin") {
      redirect("/transaksi");
    }
  }

  return (
    <TransactionDetailClient
      id={id}
      type={resolvedType}
      transaction={JSON.parse(JSON.stringify(transactionData))}
      storeSettings={JSON.parse(JSON.stringify(storeSettings))}
    />
  );
}

