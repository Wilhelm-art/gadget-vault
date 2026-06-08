import React from "react";
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

export default async function TransactionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const { id } = await params;
  const pSearchParams = await searchParams;
  const type = pSearchParams.type as "sewa" | "beli" | "jual" | undefined;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  let transactionData: any = null;
  let resolvedType: "sewa" | "beli" | "jual" = "sewa";

  // Fetch the store settings for bank accounts & addresses
  const storeSettings = await prisma.storeSettings.findFirst();
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

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <TransactionDetailClient
        id={id}
        type={resolvedType}
        transaction={JSON.parse(JSON.stringify(transactionData))}
        storeSettings={JSON.parse(JSON.stringify(storeSettings))}
      />
    </div>
  );
}
