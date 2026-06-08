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
    const { isBlacklisted } = await req.json();

    if (isBlacklisted === undefined) {
      return NextResponse.json({ message: "Status blacklist required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    if (user.role === "admin") {
      return NextResponse.json({ message: "Admin tidak bisa di-blacklist." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlacklisted },
    });

    // Notify user if blacklisted
    if (isBlacklisted) {
      await prisma.notification.create({
        data: {
          userId: id,
          title: "Akun Anda Ditangguhkan",
          message: "Akun Anda telah ditangguhkan (blacklist) oleh Admin karena pelanggaran kebijakan sewa. Silakan hubungi toko untuk informasi lebih lanjut.",
          type: "kyc",
        },
      });
    }

    return NextResponse.json(
      { message: "Status blacklist pelanggan berhasil diperbarui.", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Customer PATCH Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat memperbarui data pelanggan." },
      { status: 500 }
    );
  }
}
