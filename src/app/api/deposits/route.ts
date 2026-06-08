import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { uploadFile, getPublicUrl } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Parse form data
    const formData = await req.formData();
    const rentalId = formData.get("rentalId") as string;
    const bankName = formData.get("bankName") as string;
    const accountNumber = formData.get("accountNumber") as string;
    const file = formData.get("file") as File | null;

    if (!rentalId || !bankName || !accountNumber || !file) {
      return NextResponse.json(
        { message: "Semua field (Rental ID, Nama Bank, Nomor Rekening, dan File Bukti Transfer) wajib diisi." },
        { status: 400 }
      );
    }

    // Verify deposit record exists and belongs to user
    const deposit = await prisma.deposit.findFirst({
      where: {
        rentalId,
        userId,
      },
    });

    if (!deposit) {
      return NextResponse.json(
        { message: "Data jaminan sewa (deposit) tidak ditemukan untuk transaksi ini." },
        { status: 404 }
      );
    }

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "Ukuran file bukti transfer maksimal 5MB." }, { status: 400 });
    }

    // Upload transfer proof file to Supabase Storage in 'deposits' bucket
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${rentalId}-${Date.now()}.${fileExt}`;
    const storagePath = `${userId}/${fileName}`;

    await uploadFile(buffer, "deposits", storagePath, file.type);

    // Get public URL (since we want to display it to admin, although deposits is private we can get direct public url if configured, 
    // or store storage path for signed url. Let's store getPublicUrl or signed url.
    // Storing getPublicUrl is convenient for viewing inside standard image elements)
    const publicUrl = getPublicUrl("deposits", storagePath);

    // Update Deposit record in DB
    const updatedDeposit = await prisma.$transaction(async (tx) => {
      const uDep = await tx.deposit.update({
        where: { id: deposit.id },
        data: {
          transferProofUrl: publicUrl,
          storagePath,
          bankName,
          accountNumber,
          status: "pending", // set/reset status to pending for admin verification
        },
      });

      // Update rental status notes or create notification
      await tx.notification.create({
        data: {
          userId,
          title: "Bukti Transfer Deposit Diunggah",
          message: "Bukti transfer uang jaminan (deposit) Anda telah diunggah dan sedang diproses verifikasi oleh Admin.",
          type: "deposit",
          referenceId: uDep.id,
        },
      });

      return uDep;
    });

    return NextResponse.json(
      { message: "Bukti transfer deposit berhasil diunggah.", deposit: updatedDeposit },
      { status: 200 }
    );
  } catch (error) {
    console.error("Deposits POST Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengunggah bukti transfer deposit." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get all deposits for Admin with rental & user info
    const deposits = await prisma.deposit.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        rental: {
          select: { transactionCode: true, totalAmount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deposits, { status: 200 });
  } catch (error) {
    console.error("Deposits GET Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data deposit." },
      { status: 500 }
    );
  }
}
