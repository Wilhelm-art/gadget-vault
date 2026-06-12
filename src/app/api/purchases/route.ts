import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Verify that the user exists in the database (handles stale session cookies)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Sesi Anda telah kedaluwarsa atau akun tidak ditemukan. Silakan keluar dan masuk kembali." },
        { status: 401 }
      );
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 });
    }

    // 1. Fetch product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
    }

    if (!product.isSellable || product.status !== "ready") {
      return NextResponse.json(
        { message: "Produk tidak tersedia untuk dibeli." },
        { status: 400 }
      );
    }

    if (!product.sellPrice) {
      return NextResponse.json(
        { message: "Harga produk tidak valid." },
        { status: 400 }
      );
    }

    // 2. Generate transaction code: GV-BUY-[timestamp]
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const transactionCode = `GV-BUY-${dateStr}-${randStr}`;

    // 3. Create purchase transaction
    const transaction = await prisma.$transaction(async (tx) => {
      const pTx = await tx.purchaseTransaction.create({
        data: {
          transactionCode,
          userId,
          productId,
          amount: product.sellPrice!,
          status: "pending",
        },
      });

      // Create a notification for the user
      await tx.notification.create({
        data: {
          userId,
          title: "Pengajuan Pembelian Diajukan",
          message: `Permintaan pembelian untuk ${product.name} telah berhasil diajukan dengan kode ${transactionCode}. Silakan datang ke toko setelah status dikonfirmasi oleh Admin.`,
          type: "purchase",
          referenceId: pTx.id,
        },
      });

      return pTx;
    });

    return NextResponse.json(
      { message: "Pengajuan pembelian berhasil dibuat.", transaction },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Purchases API Error:", error);
    return NextResponse.json(
      { message: `Terjadi kesalahan internal: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}
