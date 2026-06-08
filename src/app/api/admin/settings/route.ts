import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      return NextResponse.json({ message: "Settings not initialized" }, { status: 404 });
    }
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeName,
      address,
      phone,
      whatsapp,
      email,
      googleMapsEmbed,
      depositPercentage,
      bankName,
      bankAccountNumber,
      bankAccountName,
      operatingHours,
    } = body;

    if (
      !storeName || !address || !phone || !whatsapp || !email || 
      !bankName || !bankAccountNumber || !bankAccountName
    ) {
      return NextResponse.json({ message: "Seluruh field data toko dan rekening wajib diisi." }, { status: 400 });
    }

    const settings = await prisma.storeSettings.findFirst();

    let updatedSettings;
    if (settings) {
      updatedSettings = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: {
          storeName,
          address,
          phone,
          whatsapp,
          email,
          googleMapsEmbed,
          depositPercentage: depositPercentage ? parseFloat(depositPercentage) : 0.20,
          bankName,
          bankAccountNumber,
          bankAccountName,
          operatingHours: operatingHours || {},
        },
      });
    } else {
      updatedSettings = await prisma.storeSettings.create({
        data: {
          storeName,
          address,
          phone,
          whatsapp,
          email,
          googleMapsEmbed,
          depositPercentage: depositPercentage ? parseFloat(depositPercentage) : 0.20,
          bankName,
          bankAccountNumber,
          bankAccountName,
          operatingHours: operatingHours || {},
        },
      });
    }

    revalidateTag("store-settings", { expire: 0 });

    return NextResponse.json(
      { message: "Pengaturan toko berhasil diperbarui.", settings: updatedSettings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Settings PUT Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat memperbarui pengaturan." },
      { status: 500 }
    );
  }
}
