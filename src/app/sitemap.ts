import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Static pages
  const staticPages = [
    "",
    "/katalog",
    "/sewa",
    "/jual",
    "/tentang",
    "/faq",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Dynamic product detail pages
  try {
    const products = await prisma.product.findMany({
      where: { status: "ready" },
      select: { slug: true, updatedAt: true },
    });

    const productPages = products.map((p) => ({
      url: `${baseUrl}/katalog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...productPages];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticPages;
  }
}
