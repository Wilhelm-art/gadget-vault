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

    const { id } = await params; // KycDocument ID
    const { status, rejectionReason } = await req.json();
    const adminId = (session.user as any).id;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Status verifikasi tidak valid." }, { status: 400 });
    }

    if (status === "rejected" && !rejectionReason) {
      return NextResponse.json({ message: "Alasan penolakan wajib diisi." }, { status: 400 });
    }

    // Fetch KYC Document
    const kycDoc = await prisma.kycDocument.findUnique({
      where: { id },
    });

    if (!kycDoc) {
      return NextResponse.json({ message: "Berkas KYC tidak ditemukan." }, { status: 404 });
    }

    // Update inside a transaction
    const updatedKyc = await prisma.$transaction(async (tx) => {
      const uKyc = await tx.kycDocument.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === "rejected" ? rejectionReason : null,
          verifiedBy: adminId,
          verifiedAt: new Date(),
        },
      });

      // Update the user's KYC status
      await tx.user.update({
        where: { id: kycDoc.userId },
        data: {
          kycStatus: status === "approved" ? "verified" : "rejected",
        },
      });

      // Send notification to user
      const notifTitle = status === "approved" ? "Verifikasi KYC Disetujui" : "Verifikasi KYC Ditolak";
      const notifMsg = status === "approved"
        ? "Selamat! Berkas identitas KYC Anda telah disetujui. Sekarang Anda dapat menggunakan layanan sewa di GadgetVault."
        : `Verifikasi identitas KYC Anda ditolak. Alasan: ${rejectionReason}. Silakan unggah berkas yang benar kembali.`;

      await tx.notification.create({
        data: {
          userId: kycDoc.userId,
          title: notifTitle,
          message: notifMsg,
          type: "kyc",
        },
      });

      return uKyc;
    });

    return NextResponse.json(
      { message: "Verifikasi KYC berhasil diperbarui.", kyc: updatedKyc },
      { status: 200 }
    );
  } catch (error) {
    console.error("KYC PATCH Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat memperbarui verifikasi KYC." },
      { status: 500 }
    );
  }
}
