import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import slugify from "slugify";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
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

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    
    // Check if slug exists
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // 3. Create product in a transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name,
          slug,
          brand,
          model,
          description,
          condition,
          sellPrice: sellPrice ? parseFloat(sellPrice) : null,
          rentPriceDaily: rentPriceDaily ? parseFloat(rentPriceDaily) : null,
          rentPriceWeekly: rentPriceWeekly ? parseFloat(rentPriceWeekly) : null,
          status: status || "ready",
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

    revalidateTag("products", { expire: 0 });
    revalidateTag("featured-products", { expire: 0 });

    return NextResponse.json(
      { message: "Produk berhasil ditambahkan!", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Products POST Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat membuat produk." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const isFeatured = searchParams.get("isFeatured") === "true" ? true : undefined;

    const products = await prisma.product.findMany({
      where: {
        category: category ? { slug: category } : undefined,
        isFeatured,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Products GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
