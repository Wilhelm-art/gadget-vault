import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadFile, getPublicUrl } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    // 1. Authenticate admin
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "products"; // target folder: products, kyc, etc.

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "Ukuran file maksimal 5MB." }, { status: 400 });
    }

    // 3. Upload file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    
    // Upload inside target folder path
    const storagePath = `${folder}/${fileName}`;
    
    await uploadFile(buffer, folder, storagePath, file.type);
    
    // Get public URL (since products is public, for kyc we use signed urls dynamically)
    let imageUrl = "";
    if (folder === "products" || folder === "sell-offers") {
      imageUrl = getPublicUrl(folder, storagePath);
    }

    return NextResponse.json(
      {
        message: "Upload berhasil!",
        storagePath,
        imageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload Route Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengunggah file." },
      { status: 500 }
    );
  }
}
