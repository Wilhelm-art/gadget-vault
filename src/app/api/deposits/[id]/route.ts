import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();
    const adminId = (session.user as any).id;

    if (!status || !["verified", "refunded", "forfeited", "pending"].includes(status)) {
      return NextResponse.json({ message: "Status deposit tidak valid." }, { status: 400 });
    }

    // Fetch deposit detail
    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        rental: {
          select: { transactionCode: true },
        },
      },
    });

    if (!deposit) {
      return NextResponse.json({ message: "Data deposit tidak ditemukan." }, { status: 404 });
    }

    // Determine notification title and content
    let notificationTitle = "";
    let notificationMessage = "";

    const formattedAmount = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(deposit.amount));

    if (status === "verified") {
      notificationTitle = "Jaminan Sewa Terverifikasi";
      notificationMessage = `Uang jaminan (deposit) sebesar ${formattedAmount} untuk kode sewa ${deposit.rental.transactionCode} telah diverifikasi oleh Admin.`;
    } else if (status === "refunded") {
      notificationTitle = "Jaminan Sewa Direfund";
      notificationMessage = `Uang jaminan (deposit) sebesar ${formattedAmount} untuk kode sewa ${deposit.rental.transactionCode} telah dikembalikan (refund) ke rekening Anda.`;
    } else if (status === "forfeited") {
      notificationTitle = "Jaminan Sewa Hangus";
      notificationMessage = `Uang jaminan (deposit) sebesar ${formattedAmount} untuk kode sewa ${deposit.rental.transactionCode} dinyatakan hangus/disita karena ketidakpatuhan atau kerusakan perangkat sewa.`;
    }

    // Update DB
    const updatedDeposit = await prisma.$transaction(async (tx) => {
      const uDep = await tx.deposit.update({
        where: { id },
        data: {
          status,
          verifiedBy: adminId,
          verifiedAt: status === "verified" ? new Date() : undefined,
          refundedAt: status === "refunded" ? new Date() : undefined,
        },
      });

      // Send notification if title exists
      if (notificationTitle) {
        await tx.notification.create({
          data: {
            userId: deposit.userId,
            title: notificationTitle,
            message: notificationMessage,
            type: "deposit",
            referenceId: deposit.id,
          },
        });
      }

      return uDep;
    });

    return NextResponse.json(
      { message: "Status deposit berhasil diperbarui.", deposit: updatedDeposit },
      { status: 200 }
    );
  } catch (error) {
    console.error("Deposits PATCH Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat memperbarui status deposit." },
      { status: 500 }
    );
  }
}
