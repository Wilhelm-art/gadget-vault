import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, phone, address, city, province } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Nama wajib diisi." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        address,
        city,
        province,
      },
    });

    return NextResponse.json(
      { message: "Profil berhasil diperbarui.", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui profil." },
      { status: 500 }
    );
  }
}
