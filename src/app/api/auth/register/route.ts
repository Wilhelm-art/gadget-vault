import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().min(9, "Nomor telepon minimal 9 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  province: z.string().min(2, "Provinsi minimal 2 karakter"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate payload
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone, address, city, province } = parsed.data;

    // 2. Reject if body contains role=admin (security guard)
    if ((body as any).role === "admin") {
      return NextResponse.json(
        { message: "Registrasi tidak diizinkan." },
        { status: 403 }
      );
    }

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If existing user is an admin, don't reveal it
      if (existingUser.role === "admin") {
        return NextResponse.json(
          { message: "Email sudah terdaftar. Silakan gunakan email lain." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: "Email sudah terdaftar. Silakan gunakan email lain." },
        { status: 400 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        address,
        city,
        province,
        role: "customer",
        kycStatus: "unverified",
      },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil!",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
