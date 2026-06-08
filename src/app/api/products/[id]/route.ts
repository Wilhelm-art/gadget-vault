import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Produk tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Products GET ID Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate admin
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    const body = await req.json();
    const {
      name,
      brand,
      model,
      description,
      condition,
      sellPrice,
      rentPriceDaily,
      rentPriceWeekly,
      status,
      stockQuantity,
      isFeatured,
      isRentable,
      isSellable,
      categoryId,
      images,
      specs,
    } = body;

    if (!name || !brand || !model || !condition || !categoryId) {
      return NextResponse.json({ message: "Data produk belum lengkap." }, { status: 400 });
    }

    // 3. Update product, delete old specs/images and create new ones in transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Get old images to check if we deleted any, so we can clean up Supabase Storage
      const oldImages = await tx.productImage.findMany({ where: { productId: id } });

      // Determine which files were deleted
      const newStoragePaths = (images || []).map((img: any) => img.storagePath);
      const deletedImages = oldImages.filter((img) => !newStoragePaths.includes(img.storagePath));

      // Clean up Supabase Storage for deleted files
      for (const img of deletedImages) {
        try {
          await deleteFile("products", img.storagePath);
        } catch (err) {
          console.error("Failed to delete storage file:", img.storagePath, err);
        }
      }

      // Delete existing specs and images from DB
      await tx.productSpec.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });

      // Update core product details
      const prod = await tx.product.update({
        where: { id },
        data: {
          name,
          brand,
          model,
          description,
          condition,
          sellPrice: sellPrice ? parseFloat(sellPrice) : null,
          rentPriceDaily: rentPriceDaily ? parseFloat(rentPriceDaily) : null,
          rentPriceWeekly: rentPriceWeekly ? parseFloat(rentPriceWeekly) : null,
          status,
          stockQuantity: parseInt(stockQuantity) || 1,
          isFeatured: !!isFeatured,
          isRentable: !!isRentable,
          isSellable: !!isSellable,
          categoryId,
          images: {
            create: (images || []).map((img: any) => ({
              imageUrl: img.imageUrl,
              storagePath: img.storagePath,
              isPrimary: !!img.isPrimary,
              sortOrder: parseInt(img.sortOrder) || 0,
            })),
          },
          specs: {
            create: (specs || []).map((spec: any) => ({
              specKey: spec.specKey,
              specValue: spec.specValue,
              sortOrder: parseInt(spec.sortOrder) || 0,
            })),
          },
        },
      });

      return prod;
    });

    return NextResponse.json(
      { message: "Produk berhasil diperbarui!", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Products PUT Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat memperbarui produk." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate admin
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch product images to delete them from Supabase Storage
    const images = await prisma.productImage.findMany({
      where: { productId: id },
    });

    // 3. Delete files from Supabase Storage
    for (const img of images) {
      try {
        await deleteFile("products", img.storagePath);
      } catch (err) {
        console.error("Failed to delete storage file:", img.storagePath, err);
      }
    }

    // 4. Delete product from database (specs and images will be deleted automatically due to Cascade)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produk berhasil dihapus." }, { status: 200 });
  } catch (error) {
    console.error("Products DELETE Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat menghapus produk." },
      { status: 500 }
    );
  }
}
