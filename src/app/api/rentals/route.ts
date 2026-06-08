import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // 2. Fetch user profile to verify KYC status and city location
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    if (user.kycStatus !== "verified") {
      return NextResponse.json(
        { message: "Verifikasi KYC Anda belum disetujui. Silakan selesaikan KYC terlebih dahulu." },
        { status: 400 }
      );
    }

    // 3. Parse and validate parameters
    const body = await req.json();
    const { productId, startDate: startDateStr, endDate: endDateStr } = body;

    if (!productId || !startDateStr || !endDateStr) {
      return NextResponse.json(
        { message: "Product ID, Tanggal Mulai, dan Tanggal Selesai wajib diisi." },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ message: "Format tanggal tidak valid." }, { status: 400 });
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { message: "Tanggal selesai sewa tidak boleh sebelum tanggal mulai." },
        { status: 400 }
      );
    }

    // 4. Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isRentable || product.status !== "ready") {
      return NextResponse.json(
        { message: "Produk tidak tersedia untuk disewa." },
        { status: 400 }
      );
    }

    if (!product.rentPriceDaily) {
      return NextResponse.json({ message: "Tarif sewa produk tidak valid." }, { status: 400 });
    }

    // 5. Check date overlap with existing rentals for this product
    const overlappingRentals = await prisma.rentalTransaction.findFirst({
      where: {
        productId,
        status: {
          in: ["pending", "approved", "picked_up", "returned"],
        },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (overlappingRentals) {
      return NextResponse.json(
        { message: "Jadwal tanggal sewa bertabrakan dengan penyewa lain yang sudah memesan." },
        { status: 400 }
      );
    }

    // 6. Calculate pricing and deposits
    // Duration in days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

    const dailyRate = parseFloat(product.rentPriceDaily.toString());
    const totalAmount = durationDays * dailyRate;

    // Fetch store settings for deposit %
    const settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      return NextResponse.json({ message: "Store settings are not initialized." }, { status: 500 });
    }

    const userCity = user.city || "";
    const isOutOfTown = !(
      userCity.toLowerCase().includes("bandung") ||
      userCity.toLowerCase().includes("cimahi")
    );

    const depositAmount = isOutOfTown ? totalAmount * parseFloat(settings.depositPercentage.toString()) : 0;

    // 7. Generate transaction code: GV-RENT-[date]-[rand]
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const transactionCode = `GV-RENT-${dateStr}-${randStr}`;

    // 8. Create transactions in DB
    const rental = await prisma.$transaction(async (tx) => {
      const rTx = await tx.rentalTransaction.create({
        data: {
          transactionCode,
          userId,
          productId,
          startDate,
          endDate,
          durationDays,
          dailyRate,
          totalAmount,
          depositAmount,
          status: "pending",
        },
      });

      // If out of town, create a pending Deposit record
      if (isOutOfTown) {
        await tx.deposit.create({
          data: {
            rentalId: rTx.id,
            userId,
            amount: depositAmount,
            status: "pending",
          },
        });
      }

      // Create user notification
      await tx.notification.create({
        data: {
          userId,
          title: "Reservasi Sewa Diajukan",
          message: `Permintaan sewa perangkat ${product.name} telah diajukan dengan kode ${transactionCode}. Silakan tunggu verifikasi admin.`,
          type: "rental",
          referenceId: rTx.id,
        },
      });

      return rTx;
    });

    return NextResponse.json(
      { message: "Reservasi sewa berhasil dibuat.", rental },
      { status: 201 }
    );
  } catch (error) {
    console.error("Rentals POST API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // 2. Fetch rentals
    // If admin -> fetch all. If user -> fetch own.
    const rentals = await prisma.rentalTransaction.findMany({
      where: role === "admin" ? {} : { userId },
      include: {
        product: {
          select: { name: true, brand: true, images: { take: 1 } },
        },
        user: {
          select: { name: true, email: true },
        },
        deposit: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rentals, { status: 200 });
  } catch (error) {
    console.error("Rentals GET API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
