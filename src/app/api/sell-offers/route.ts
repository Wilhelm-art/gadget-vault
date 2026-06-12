import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { uploadFile, getPublicUrl } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
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

    // 2. Parse form data
    const formData = await req.formData();
    const itemName = formData.get("itemName") as string;
    const categoryId = formData.get("categoryId") as string;
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const condition = formData.get("condition") as string;
    const description = formData.get("description") as string;
    const completeness = formData.get("completeness") as string;
    const askingPriceStr = formData.get("askingPrice") as string | null;
    const imageFiles = formData.getAll("images") as File[];

    if (!itemName || !categoryId || !brand || !model || !condition || !description || !completeness) {
      return NextResponse.json(
        { message: "Semua field info barang, kondisi, deskripsi, dan kelengkapan wajib diisi." },
        { status: 400 }
      );
    }

    if (imageFiles.length < 3) {
      return NextResponse.json(
        { message: "Minimal unggah 3 foto perangkat Anda." },
        { status: 400 }
      );
    }

    if (imageFiles.length > 10) {
      return NextResponse.json(
        { message: "Maksimal unggah 10 foto perangkat Anda." },
        { status: 400 }
      );
    }

    const askingPrice = askingPriceStr ? parseFloat(askingPriceStr) : null;

    // 3. Upload images and save to DB inside a transaction
    const sellOffer = await prisma.$transaction(async (tx) => {
      // Create the SellOffer record
      const offer = await tx.sellOffer.create({
        data: {
          userId,
          itemName,
          categoryId,
          brand,
          model,
          condition,
          description,
          completeness,
          askingPrice,
          status: "pending",
        },
      });

      // Upload files
      const imageRecords = [];
      let sortOrder = 0;

      for (const file of imageFiles) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Ukuran foto maksimal 5MB.");
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const storagePath = `${userId}/${offer.id}/${fileName}`;

        // Upload to 'sell-offers' bucket
        await uploadFile(buffer, "sell-offers", storagePath, file.type);
        
        // Initially, we can get public URL or use signed URL.
        // We will store getPublicUrl here or just store storagePath and retrieve signed/public dynamically.
        // Let's store public URL for simplicity if it becomes public later, or getPublicUrl(bucket, storagePath).
        const imageUrl = getPublicUrl("sell-offers", storagePath);

        imageRecords.push({
          sellOfferId: offer.id,
          imageUrl,
          storagePath,
          sortOrder: sortOrder++,
        });
      }

      // Bulk insert sell offer images
      await tx.sellOfferImage.createMany({
        data: imageRecords,
      });

      // Create a notification for the user
      await tx.notification.create({
        data: {
          userId,
          title: "Penawaran Jual Diajukan",
          message: `Penawaran jual perangkat ${brand} ${model} Anda berhasil diajukan. Admin akan segera meninjau kondisi dan memberikan taksiran harga.`,
          type: "sell",
          referenceId: offer.id,
        },
      });

      return offer;
    });

    return NextResponse.json(
      { message: "Penawaran jual berhasil diajukan.", sellOffer },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Sell Offers POST Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal. Silakan coba lagi." },
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

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    let offers;
    if (role === "admin") {
      offers = await prisma.sellOffer.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" } },
        },
      });
    } else {
      offers = await prisma.sellOffer.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" } },
        },
      });
    }

    return NextResponse.json(offers, { status: 200 });
  } catch (error) {
    console.error("Sell Offers GET Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat mengambil penawaran." },
      { status: 500 }
    );
  }
}
