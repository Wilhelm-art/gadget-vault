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

    const offer = await prisma.sellOffer.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, city: true, province: true } },
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!offer) {
      return NextResponse.json({ message: "Penawaran tidak ditemukan." }, { status: 404 });
    }

    // Access control: only the offer creator or admin can view
    if (offer.userId !== userId && role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(offer, { status: 200 });
  } catch (error) {
    console.error("Sell Offer GET Detail Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat mengambil detail penawaran." },
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
    const { status, offeredPrice, adminNotes } = await req.json();

    const offer = await prisma.sellOffer.findUnique({
      where: { id },
    });

    if (!offer) {
      return NextResponse.json({ message: "Penawaran tidak ditemukan." }, { status: 404 });
    }

    // Role and status verification
    let updateData: any = {};
    let notificationTitle = "";
    let notificationMessage = "";

    if (role === "admin") {
      // Admin actions: review condition, set offered price, change status
      if (status) {
        if (!["reviewed", "offered", "rejected", "completed"].includes(status)) {
          return NextResponse.json({ message: "Status tidak valid untuk Admin." }, { status: 400 });
        }
        updateData.status = status;
      }
      
      if (offeredPrice !== undefined) {
        updateData.offeredPrice = offeredPrice;
      }

      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes;
      }

      // Generate notification templates based on what changes
      if (status === "offered" && offeredPrice) {
        const formattedPrice = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(offeredPrice);

        notificationTitle = "Taksiran Harga Diberikan";
        notificationMessage = `Admin telah memberikan taksiran harga sebesar ${formattedPrice} untuk perangkat Anda (${offer.brand} ${offer.model}). Silakan periksa detail penawaran untuk Menerima atau Menolak.`;
      } else if (status === "rejected") {
        notificationTitle = "Penawaran Jual Ditolak";
        notificationMessage = `Penawaran jual perangkat Anda (${offer.brand} ${offer.model}) telah ditolak oleh Admin. Alasan: ${adminNotes || "-"}`;
      } else if (status === "completed") {
        notificationTitle = "Transaksi Jual Selesai";
        notificationMessage = `Transaksi penjualan perangkat ${offer.brand} ${offer.model} Anda telah selesai dan dana telah dibayarkan offline di toko. Terima kasih telah bertransaksi dengan GadgetVault!`;
      }
    } else {
      // User actions: can only accept or reject a store's price offer
      if (offer.userId !== userId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      if (!["accepted", "rejected"].includes(status)) {
        return NextResponse.json(
          { message: "Pelanggan hanya bisa menyetujui (accepted) atau menolak (rejected) penawaran." },
          { status: 400 }
        );
      }

      if (offer.status !== "offered") {
        return NextResponse.json(
          { message: "Anda hanya bisa merespon penawaran yang berstatus 'offered'." },
          { status: 400 }
        );
      }

      updateData.status = status;

      if (status === "accepted") {
        notificationTitle = "Penawaran Disetujui Pelanggan";
        notificationMessage = `Pelanggan menyetujui taksiran harga Anda untuk ${offer.brand} ${offer.model}. Silakan jadwalkan serah terima perangkat.`;
      } else {
        notificationTitle = "Penawaran Ditolak Pelanggan";
        notificationMessage = `Pelanggan menolak taksiran harga Anda untuk ${offer.brand} ${offer.model}.`;
      }
    }

    const updatedOffer = await prisma.$transaction(async (tx) => {
      const uOffer = await tx.sellOffer.update({
        where: { id },
        data: updateData,
      });

      // Send notification
      // If admin updated, send to user. If user updated, send to admin (since admin does not have a single userId,
      // we can broadcast it or we can find all admin users and create notification for them, or just write it for the offer user.
      // Usually, user notifications are for the customer. Let's create user notification if role === 'admin'.
      // If role === 'customer', we notify the customer that their response is saved.
      if (role === "admin") {
        await tx.notification.create({
          data: {
            userId: offer.userId,
            title: notificationTitle,
            message: notificationMessage,
            type: "sell",
            referenceId: offer.id,
          },
        });
      } else {
        // Customer notification
        await tx.notification.create({
          data: {
            userId: offer.userId,
            title: status === "accepted" ? "Anda Menyetujui Penawaran" : "Anda Menolak Penawaran",
            message: status === "accepted" 
              ? `Anda telah menyetujui taksiran harga. Silakan bawa perangkat beserta kelengkapan Anda ke toko GadgetVault untuk verifikasi fisik final.`
              : `Anda telah menolak taksiran harga dari toko. Terima kasih telah mengajukan penawaran.`,
            type: "sell",
            referenceId: offer.id,
          },
        });
      }

      return uOffer;
    });

    return NextResponse.json(
      { message: "Penawaran berhasil diperbarui.", sellOffer: updatedOffer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sell Offer PATCH Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat memperbarui penawaran." },
      { status: 500 }
    );
  }
}
