import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // 2. Parse form data
    const formData = await req.formData();
    const ktpNumber = formData.get("ktpNumber") as string;
    const ktpFrontFile = formData.get("ktpFront") as File | null;
    const ktpBackFile = formData.get("ktpBack") as File | null;
    const selfieKtpFile = formData.get("selfieKtp") as File | null;

    if (!ktpNumber || !ktpFrontFile || !ktpBackFile || !selfieKtpFile) {
      return NextResponse.json(
        { message: "Semua dokumen wajib diunggah dan nomor KTP wajib diisi." },
        { status: 400 }
      );
    }

    // Validate KTP number format (16 digits)
    if (!/^\d{16}$/.test(ktpNumber)) {
      return NextResponse.json(
        { message: "Nomor KTP harus terdiri dari 16 digit angka." },
        { status: 400 }
      );
    }

    // 3. Convert files to buffers
    const ktpFrontBuffer = Buffer.from(await ktpFrontFile.arrayBuffer());
    const ktpBackBuffer = Buffer.from(await ktpBackFile.arrayBuffer());
    const selfieKtpBuffer = Buffer.from(await selfieKtpFile.arrayBuffer());

    // 4. Upload files to Supabase Storage (kyc bucket)
    // File names: kyc/[userId]/[doc_type].[extension]
    const ktpFrontExt = ktpFrontFile.name.split(".").pop() || "jpg";
    const ktpBackExt = ktpBackFile.name.split(".").pop() || "jpg";
    const selfieKtpExt = selfieKtpFile.name.split(".").pop() || "jpg";

    const ktpFrontPath = `${userId}/ktp_front.${ktpFrontExt}`;
    const ktpBackPath = `${userId}/ktp_back.${ktpBackExt}`;
    const selfieKtpPath = `${userId}/selfie_ktp.${selfieKtpExt}`;

    await uploadFile(ktpFrontBuffer, "kyc", ktpFrontPath, ktpFrontFile.type);
    await uploadFile(ktpBackBuffer, "kyc", ktpBackPath, ktpBackFile.type);
    await uploadFile(selfieKtpBuffer, "kyc", selfieKtpPath, selfieKtpFile.type);

    // 5. Save or update KYC document in database
    // We use transaction to update user status to pending and create/update kycDocument
    await prisma.$transaction(async (tx) => {
      // Delete existing KYC documents if any, to avoid duplicate rows for a single user
      await tx.kycDocument.deleteMany({
        where: { userId },
      });

      // Create new KYC record
      await tx.kycDocument.create({
        data: {
          userId,
          ktpNumber,
          ktpFrontUrl: ktpFrontPath,
          ktpBackUrl: ktpBackPath,
          selfieKtpUrl: selfieKtpPath,
          status: "pending",
        },
      });

      // Update user kycStatus to "pending"
      await tx.user.update({
        where: { id: userId },
        data: { kycStatus: "pending" },
      });

      // Create a notification for the user
      await tx.notification.create({
        data: {
          userId,
          title: "KYC Sedang Ditinjau",
          message: "Dokumen identitas Anda telah berhasil diunggah dan sedang dalam proses verifikasi oleh Admin.",
          type: "kyc",
        },
      });
    });

    return NextResponse.json(
      { message: "Dokumen KYC berhasil diunggah. Menunggu verifikasi admin." },
      { status: 200 }
    );
  } catch (error) {
    console.error("KYC Upload Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat mengunggah dokumen." },
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

    const kycDoc = await prisma.kycDocument.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!kycDoc) {
      return NextResponse.json({ kycStatus: "unverified" }, { status: 200 });
    }

    return NextResponse.json(kycDoc, { status: 200 });
  } catch (error) {
    console.error("KYC Fetch Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat mengambil data." },
      { status: 500 }
    );
  }
}
