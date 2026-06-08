import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // 2. Fetch rental detail
    const rental = await prisma.rentalTransaction.findUnique({
      where: { id },
      include: {
        product: {
          include: { images: true },
        },
        user: true,
        deposit: true,
        photos: true,
      },
    });

    if (!rental) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    // Security: users can only view their own rentals, admin can view all
    if (role !== "admin" && rental.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(rental, { status: 200 });
  } catch (error) {
    console.error("Rentals GET ID Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const body = await req.json();
    const { status, adminNotes, pickupPhotoUrl, pickupPhotoStoragePath, returnPhotoUrl, returnPhotoStoragePath } = body;

    // 2. Find rental
    const rental = await prisma.rentalTransaction.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!rental) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    // 3. User validation
    // User can only cancel if it's pending
    if (role !== "admin") {
      if (rental.userId !== userId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      if (status !== "cancelled") {
        return NextResponse.json({ message: "Hanya Admin yang dapat mengubah status ini." }, { status: 400 });
      }
      if (rental.status !== "pending") {
        return NextResponse.json({ message: "Penyewaan yang sudah diproses tidak bisa dibatalkan." }, { status: 400 });
      }
    }

    // 4. Update status & side effects in database transaction
    const updatedRental = await prisma.$transaction(async (tx) => {
      const dataToUpdate: any = {};
      
      if (status) dataToUpdate.status = status;
      if (adminNotes !== undefined) dataToUpdate.adminNotes = adminNotes;

      // Log status changes
      if (status === "approved") {
        dataToUpdate.approvedBy = userId;
        dataToUpdate.approvedAt = new Date();
      } else if (status === "picked_up") {
        dataToUpdate.pickedUpAt = new Date();
        // If pickup photo is provided, create record
        if (pickupPhotoUrl && pickupPhotoStoragePath) {
          await tx.rentalPhoto.create({
            data: {
              rentalId: id,
              type: "pickup",
              photoUrl: pickupPhotoUrl,
              storagePath: pickupPhotoStoragePath,
            },
          });
        }
        // Change product status to rented
        await tx.product.update({
          where: { id: rental.productId },
          data: { status: "rented" },
        });
      } else if (status === "returned") {
        dataToUpdate.returnedAt = new Date();
        // If return photo is provided, create record
        if (returnPhotoUrl && returnPhotoStoragePath) {
          await tx.rentalPhoto.create({
            data: {
              rentalId: id,
              type: "return",
              photoUrl: returnPhotoUrl,
              storagePath: returnPhotoStoragePath,
            },
          });
        }
      } else if (status === "completed") {
        // Change product status back to ready
        await tx.product.update({
          where: { id: rental.productId },
          data: { status: "ready" },
        });
      } else if (status === "cancelled") {
        // Change product status back to ready if it was rented/picked up before
        if (rental.status === "picked_up" || rental.status === "approved") {
          await tx.product.update({
            where: { id: rental.productId },
            data: { status: "ready" },
          });
        }
      }

      const updated = await tx.rentalTransaction.update({
        where: { id },
        data: dataToUpdate,
      });

      // Create notification for user
      await tx.notification.create({
        data: {
          userId: rental.userId,
          title: `Status Sewa Diperbarui: ${status.toUpperCase()}`,
          message: `Status penyewaan Anda dengan kode ${rental.transactionCode} telah diperbarui menjadi ${status.toUpperCase()}.`,
          type: "rental",
          referenceId: id,
        },
      });

      return updated;
    });

    return NextResponse.json(
      { message: "Status sewa berhasil diperbarui.", rental: updatedRental },
      { status: 200 }
    );
  } catch (error) {
    console.error("Rentals PATCH ID Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat memperbarui status sewa." },
      { status: 500 }
    );
  }
}
