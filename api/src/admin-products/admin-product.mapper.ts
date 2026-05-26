import type { Prisma } from "@prisma/client";
import { getInventoryLevel } from "./inventory-policy";

export const adminProductInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: [{ color: "asc" as const }, { size: "asc" as const }, { sku: "asc" as const }] },
} satisfies Prisma.ProductInclude;

export const inventoryVariantInclude = {
  product: {
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
    },
  },
} satisfies Prisma.ProductVariantInclude;

type AdminProductRecord = Prisma.ProductGetPayload<{ include: typeof adminProductInclude }>;
type InventoryVariantRecord = Prisma.ProductVariantGetPayload<{ include: typeof inventoryVariantInclude }>;

export function mapAdminProduct(product: AdminProductRecord) {
  const totalStock = product.variants.filter((variant) => variant.active).reduce((sum, variant) => sum + variant.stock, 0);
  const lowStockVariants = product.variants.filter((variant) => variant.active && getInventoryLevel(variant) === "low_stock").length;
  const outOfStockVariants = product.variants.filter((variant) => variant.active && getInventoryLevel(variant) === "out_of_stock").length;

  return {
    id: product.id,
    title: product.title,
    titleEn: product.titleEn,
    titleZh: product.titleZh,
    slug: product.slug,
    category: product.category,
    shortDescription: product.shortDescription,
    shortDescriptionEn: product.shortDescriptionEn,
    shortDescriptionZh: product.shortDescriptionZh,
    description: product.description,
    descriptionEn: product.descriptionEn,
    descriptionZh: product.descriptionZh,
    seoTitle: product.seoTitle,
    seoTitleEn: product.seoTitleEn,
    seoTitleZh: product.seoTitleZh,
    seoDescription: product.seoDescription,
    seoDescriptionEn: product.seoDescriptionEn,
    seoDescriptionZh: product.seoDescriptionZh,
    canonicalUrl: product.canonicalUrl,
    ogImageUrl: product.ogImageUrl,
    status: product.status,
    badge: product.badge,
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    benefits: product.benefits,
    benefitsEn: product.benefitsEn,
    benefitsZh: product.benefitsZh,
    features: product.features,
    featuresEn: product.featuresEn,
    featuresZh: product.featuresZh,
    useCases: product.useCases,
    bundleEligible: product.bundleEligible,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      priceCents: variant.priceCents,
      compareAtPriceCents: variant.compareAtPriceCents,
      stock: variant.stock,
      lowStockThreshold: variant.lowStockThreshold,
      weightGrams: variant.weightGrams,
      active: variant.active,
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
      inventoryLevel: getInventoryLevel(variant),
    })),
    inventorySummary: {
      totalStock,
      lowStockVariants,
      outOfStockVariants,
    },
  };
}

export function mapInventoryVariant(variant: InventoryVariantRecord) {
  return {
    id: variant.id,
    sku: variant.sku,
    color: variant.color,
    size: variant.size,
    priceCents: variant.priceCents,
    compareAtPriceCents: variant.compareAtPriceCents,
    stock: variant.stock,
    lowStockThreshold: variant.lowStockThreshold,
    weightGrams: variant.weightGrams,
    active: variant.active,
    inventoryLevel: getInventoryLevel(variant),
    updatedAt: variant.updatedAt.toISOString(),
    product: variant.product,
  };
}
