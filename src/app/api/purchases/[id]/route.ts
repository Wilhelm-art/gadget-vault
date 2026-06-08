import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const purchase = await prisma.purchaseTransaction.findUnique({
      where: { id },
      include: {
        product: { include: { images: true } },
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!purchase) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    if (purchase.userId !== userId && role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(purchase, { status: 200 });
  } catch (error) {
    console.error("Purchase GET Detail Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil rincian transaksi." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const { status, adminNotes, paymentMethod } = await req.json();

    const purchase = await prisma.purchaseTransaction.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!purchase) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    // Authorization checks
    if (role !== "admin") {
      if (purchase.userId !== userId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      if (status !== "cancelled") {
        return NextResponse.json({ message: "Hanya Admin yang dapat mengubah status ini." }, { status: 400 });
      }
      if (purchase.status !== "pending") {
        return NextResponse.json({ message: "Pemesanan yang sudah diproses tidak bisa dibatalkan." }, { status: 400 });
      }
    }

    // Build update parameters
    const updateData: any = {};
    if (status) {
      if (!["pending", "confirmed", "checked", "paid", "completed", "cancelled"].includes(status)) {
        return NextResponse.json({ message: "Status pembelian tidak valid." }, { status: 400 });
      }
      updateData.status = status;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (paymentMethod !== undefined) {
      updateData.paymentMethod = paymentMethod;
    }

    if (status === "confirmed") {
      updateData.approvedBy = userId;
    }

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const updatedPurchase = await prisma.$transaction(async (tx) => {
      const uPurchase = await tx.purchaseTransaction.update({
        where: { id },
        data: updateData,
      });

      // Status side-effects: update product stock/availability if completed or cancelled
      if (status === "completed") {
        await tx.product.update({
          where: { id: purchase.productId },
          data: { status: "sold", stockQuantity: { decrement: 1 } },
        });
      } else if (status === "cancelled" && purchase.status === "completed") {
        // revert product status to ready
        await tx.product.update({
          where: { id: purchase.productId },
          data: { status: "ready", stockQuantity: { increment: 1 } },
        });
      }

      // Notification
      let notifTitle = `Pemesanan Beli ${status.toUpperCase()}`;
      let notifMsg = `Pemesanan beli gadget Anda dengan kode ${purchase.transactionCode} diperbarui ke status ${status.toUpperCase()}.`;

      if (status === "confirmed") {
        notifTitle = "Pemesanan Pembelian Dikonfirmasi";
        notifMsg = `Permintaan pembelian gadget Anda (${purchase.product.name}) telah dikonfirmasi oleh Admin. Silakan datang ke toko untuk pengecekan fisik perangkat.`;
      } else if (status === "completed") {
        notifTitle = "Transaksi Pembelian Selesai";
        notifMsg = `Transaksi pembelian gadget ${purchase.product.name} telah selesai. Terima kasih telah berbelanja di GadgetVault!`;
      }

      await tx.notification.create({
        data: {
          userId: purchase.userId,
          title: notifTitle,
          message: notifMsg,
          type: "purchase",
          referenceId: purchase.id,
        },
      });

      return uPurchase;
    });

    return NextResponse.json(
      { message: "Transaksi pembelian berhasil diperbarui.", purchase: updatedPurchase },
      { status: 200 }
    );
  } catch (error) {
    console.error("Purchase PATCH Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui transaksi pembelian." },
      { status: 500 }
    );
  }
}
