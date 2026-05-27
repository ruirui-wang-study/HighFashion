import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { ProductQueryDto } from "./dto/product-query.dto";
import { getAvailableStock, getInventoryLevel } from "../admin-products/inventory-policy";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: [{ color: "asc" as const }, { size: "asc" as const }] },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const locale = query.locale ?? "en";
    const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
    if (query.category) where.category = { equals: query.category, mode: "insensitive" };
    if (query.useCase) where.useCases = { has: query.useCase };
    if (query.size || query.color || query.priceMin !== undefined || query.priceMax !== undefined) {
      where.variants = {
        some: {
          active: true,
          ...(query.size ? { size: query.size } : {}),
          ...(query.color ? { color: query.color } : {}),
          ...(query.priceMin !== undefined || query.priceMax !== undefined
            ? { priceCents: { gte: query.priceMin, lte: query.priceMax } }
            : {}),
        },
      };
    }

    const products = await this.prisma.product.findMany({ where, include: productInclude });
    return products.map((product) => mapProduct(product, locale)).sort((a, b) => sortProducts(a, b, query.sort));
  }

  async findBySlug(slug: string, locale: "en" | "zh" = "en") {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: productInclude });
    if (!product || product.status !== "ACTIVE") {
      throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }
    return mapProduct(product, locale);
  }
}

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function mapProduct(product: ProductWithRelations, locale: "en" | "zh" = "en") {
  const activeVariants = product.variants.filter((variant) => variant.active);
  const prices = activeVariants.map((variant) => variant.priceCents);
  const comparePrices = activeVariants.map((variant) => variant.compareAtPriceCents).filter((price): price is number => price !== null);
  const inventoryLevel = activeVariants.length === 0
    ? "Out of stock"
    : activeVariants.some((variant) => getInventoryLevel(variant) === "in_stock")
      ? "In stock"
      : activeVariants.some((variant) => getInventoryLevel(variant) === "low_stock")
      ? "Low stock"
        : "Out of stock";
  const title = pickLocalizedString(locale, product.titleZh, product.titleEn, product.title);
  const shortDescription = pickLocalizedString(locale, product.shortDescriptionZh, product.shortDescriptionEn, product.shortDescription);
  const description = pickLocalizedString(locale, product.descriptionZh, product.descriptionEn, product.description);
  const seoTitle = pickLocalizedNullableString(locale, product.seoTitleZh, product.seoTitleEn, product.seoTitle);
  const seoDescription = pickLocalizedNullableString(locale, product.seoDescriptionZh, product.seoDescriptionEn, product.seoDescription);
  const benefits = pickLocalizedStringList(locale, product.benefitsZh, product.benefitsEn, product.benefits);
  const features = pickLocalizedStringList(locale, product.featuresZh, product.featuresEn, product.features);

  return {
    id: product.id,
    title,
    slug: product.slug,
    category: product.category,
    shortDescription,
    description,
    seoTitle,
    seoDescription,
    canonicalUrl: product.canonicalUrl,
    ogImageUrl: product.ogImageUrl,
    status: product.status,
    badge: product.badge,
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    benefits,
    features,
    useCases: product.useCases,
    bundleEligible: product.bundleEligible,
    priceCents: prices.length ? Math.min(...prices) : 0,
    compareAtPriceCents: comparePrices.length ? Math.min(...comparePrices) : null,
    colors: [...new Set(activeVariants.map((variant) => variant.color))],
    sizes: [...new Set(activeVariants.map((variant) => variant.size))],
    images: product.images.map((image) => image.url),
    imageObjects: product.images,
    variants: activeVariants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      priceCents: variant.priceCents,
      compareAtPriceCents: variant.compareAtPriceCents,
      stock: getAvailableStock(variant),
      lowStockThreshold: variant.lowStockThreshold,
      weightGrams: variant.weightGrams,
      active: variant.active,
    })),
    inventoryStatus: inventoryLevel,
  };
}

function pickLocalizedString(locale: "en" | "zh", zhValue: string | null, enValue: string | null, fallback: string) {
  if (locale === "zh") {
    return normalizeLocalizedValue(zhValue) ?? normalizeLocalizedValue(enValue) ?? fallback;
  }
  return normalizeLocalizedValue(enValue) ?? fallback;
}

function pickLocalizedNullableString(locale: "en" | "zh", zhValue: string | null, enValue: string | null, fallback: string | null) {
  if (locale === "zh") {
    return normalizeLocalizedValue(zhValue) ?? normalizeLocalizedValue(enValue) ?? normalizeLocalizedValue(fallback);
  }
  return normalizeLocalizedValue(enValue) ?? normalizeLocalizedValue(fallback);
}

function pickLocalizedStringList(locale: "en" | "zh", zhValues: string[], enValues: string[], fallback: string[]) {
  if (locale === "zh") {
    return normalizeLocalizedList(zhValues) ?? normalizeLocalizedList(enValues) ?? fallback;
  }
  return normalizeLocalizedList(enValues) ?? fallback;
}

function normalizeLocalizedValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeLocalizedList(values: string[] | null | undefined) {
  const normalized = values?.map((value) => value.trim()).filter(Boolean) ?? [];
  return normalized.length ? normalized : null;
}

function sortProducts(a: ReturnType<typeof mapProduct>, b: ReturnType<typeof mapProduct>, sort: ProductQueryDto["sort"] = "best") {
  if (sort === "price-asc") return a.priceCents - b.priceCents;
  if (sort === "price-desc") return b.priceCents - a.priceCents;
  if (sort === "newest") return b.id.localeCompare(a.id);
  return b.reviewCount * b.rating - a.reviewCount * a.rating;
}
