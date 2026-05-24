import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { ProductQueryDto } from "./dto/product-query.dto";
import { getInventoryLevel } from "../admin-products/inventory-policy";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: [{ color: "asc" as const }, { size: "asc" as const }] },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
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
    return products.map(mapProduct).sort((a, b) => sortProducts(a, b, query.sort));
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: productInclude });
    if (!product || product.status !== "ACTIVE") {
      throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }
    return mapProduct(product);
  }
}

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function mapProduct(product: ProductWithRelations) {
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
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    canonicalUrl: product.canonicalUrl,
    ogImageUrl: product.ogImageUrl,
    status: product.status,
    badge: product.badge,
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    benefits: product.benefits,
    features: product.features,
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
      stock: variant.stock,
      lowStockThreshold: variant.lowStockThreshold,
      weightGrams: variant.weightGrams,
      active: variant.active,
    })),
    inventoryStatus: inventoryLevel,
  };
}

function sortProducts(a: ReturnType<typeof mapProduct>, b: ReturnType<typeof mapProduct>, sort: ProductQueryDto["sort"] = "best") {
  if (sort === "price-asc") return a.priceCents - b.priceCents;
  if (sort === "price-desc") return b.priceCents - a.priceCents;
  if (sort === "newest") return b.id.localeCompare(a.id);
  return b.reviewCount * b.rating - a.reviewCount * a.rating;
}
