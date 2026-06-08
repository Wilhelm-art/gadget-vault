import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

/**
 * Fetch store settings with caching.
 * Revalidated when settings are updated via the admin dashboard.
 */
export const getCachedStoreSettings = unstable_cache(
  async () => {
    return prisma.storeSettings.findFirst();
  },
  ["store-settings"],
  {
    tags: ["store-settings"],
    revalidate: 86400, // Fallback revalidation: 24 hours
  }
);

/**
 * Fetch all categories ordered by sortOrder.
 * Revalidated when products/categories are seeded or updated.
 */
export const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
  },
  ["categories"],
  {
    tags: ["categories"],
    revalidate: 86400, // Fallback revalidation: 24 hours
  }
);

/**
 * Fetch featured products that are ready for the landing page.
 * Revalidated when products are modified.
 */
export const getCachedFeaturedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: {
        isFeatured: true,
        status: "ready",
      },
      take: 4,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },
  ["featured-products"],
  {
    tags: ["featured-products"],
    revalidate: 3600, // Fallback revalidation: 1 hour
  }
);

/**
 * Fetch a single product by its slug.
 * Key depends on the dynamic slug parameter.
 */
export const getCachedProductBySlug = (slug: string) => {
  return unstable_cache(
    async () => {
      return prisma.product.findUnique({
        where: { slug },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          specs: {
            orderBy: { sortOrder: "asc" },
          },
          category: true,
        },
      });
    },
    [`product-${slug}`],
    {
      tags: [`product-${slug}`, "products"],
      revalidate: 3600, // Fallback revalidation: 1 hour
    }
  )();
};

/**
 * Fetch related products in the same category (excluding current product).
 */
export const getCachedRelatedProducts = (slug: string, categoryId: string) => {
  return unstable_cache(
    async () => {
      return prisma.product.findMany({
        where: {
          categoryId,
          status: "ready",
          NOT: {
            slug,
          },
        },
        take: 4,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    },
    [`related-products-${slug}`],
    {
      tags: [`related-products-${slug}`, "products"],
      revalidate: 3600, // Fallback revalidation: 1 hour
    }
  )();
};
