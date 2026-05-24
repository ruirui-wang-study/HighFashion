import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { adminProductInclude, inventoryVariantInclude, mapAdminProduct } from "./admin-product.mapper";
import { getInventoryLevel } from "./inventory-policy";
import type { AdminProductQueryDto } from "./dto/admin-product-query.dto";
import type { AdminProductImageInput, AdminProductVariantInput, UpsertAdminProductDto } from "./dto/upsert-admin-product.dto";

type AdminActor = {
  adminId: string;
  adminEmail: string;
};

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminProductQueryDto) {
    const where: Prisma.ProductWhereInput = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
        { variants: { some: { sku: { contains: query.search, mode: "insensitive" } } } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.category) where.category = { equals: query.category, mode: "insensitive" };

    const products = await this.prisma.product.findMany({
      where,
      include: adminProductInclude,
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });

    const mapped = products.map(mapAdminProduct);
    return query.stock && query.stock !== "all"
      ? mapped.filter((product) => matchesStockFilter(product.variants, query.stock as "in" | "low" | "out"))
      : mapped;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: adminProductInclude });
    if (!product) {
      throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }
    return mapAdminProduct(product);
  }

  async create(actor: AdminActor, input: UpsertAdminProductDto) {
    validateProductInput(input);

    try {
      const product = await this.prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            title: input.title.trim(),
            slug: input.slug.trim(),
            category: input.category.trim(),
            shortDescription: input.shortDescription.trim(),
            description: input.description.trim(),
            seoTitle: normalizeNullableString(input.seoTitle),
            seoDescription: normalizeNullableString(input.seoDescription),
            canonicalUrl: normalizeNullableString(input.canonicalUrl),
            ogImageUrl: normalizeNullableString(input.ogImageUrl),
            badge: normalizeNullableString(input.badge),
            benefits: cleanStringList(input.benefits),
            features: cleanStringList(input.features),
            useCases: cleanStringList(input.useCases),
            bundleEligible: input.bundleEligible,
            status: input.status,
            images: { create: buildImageCreates(input.images) },
            variants: { create: buildVariantCreates(input.variants) },
          },
          include: adminProductInclude,
        });

        await createInitialVariantMovements(tx, created.id, actor.adminId, input.variants);
        await tx.auditLog.create({
          data: {
            actorId: actor.adminId,
            action: "PRODUCT_CREATED",
            resource: "product",
            resourceId: created.id,
            details: {
              title: created.title,
              slug: created.slug,
              status: created.status,
              variantCount: created.variants.length,
              actorEmail: actor.adminEmail,
            },
          },
        });

        return created;
      });

      return mapAdminProduct(product);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async update(id: string, actor: AdminActor, input: UpsertAdminProductDto) {
    validateProductInput(input);

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.product.findUnique({
          where: { id },
          include: adminProductInclude,
        });
        if (!existing) {
          throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: "Product not found" });
        }

        await tx.product.update({
          where: { id },
          data: {
            title: input.title.trim(),
            slug: input.slug.trim(),
            category: input.category.trim(),
            shortDescription: input.shortDescription.trim(),
            description: input.description.trim(),
            seoTitle: normalizeNullableString(input.seoTitle),
            seoDescription: normalizeNullableString(input.seoDescription),
            canonicalUrl: normalizeNullableString(input.canonicalUrl),
            ogImageUrl: normalizeNullableString(input.ogImageUrl),
            badge: normalizeNullableString(input.badge),
            benefits: cleanStringList(input.benefits),
            features: cleanStringList(input.features),
            useCases: cleanStringList(input.useCases),
            bundleEligible: input.bundleEligible,
            status: input.status,
          },
          include: adminProductInclude,
        });

        await tx.productImage.deleteMany({ where: { productId: id } });
        if (input.images.length > 0) {
          await tx.productImage.createMany({
            data: input.images.map((image, index) => ({
              productId: id,
              url: image.url.trim(),
              alt: image.alt.trim(),
              sortOrder: image.sortOrder ?? index,
            })),
          });
        }

        const existingVariants = new Map(existing.variants.map((variant) => [variant.id, variant]));
        for (const variant of input.variants) {
          if (variant.id && existingVariants.has(variant.id)) {
            const previous = existingVariants.get(variant.id)!;
            await tx.productVariant.update({
              where: { id: variant.id },
              data: buildVariantData(variant),
              include: inventoryVariantInclude,
            });

            const quantityDelta = variant.stock - previous.stock;
            if (quantityDelta !== 0) {
              await writeInventoryAdjustmentAudit(tx, {
                actorId: actor.adminId,
                variantId: variant.id,
                quantityDelta,
                reason: "Admin product edit",
              });
            }
          } else {
            const createdVariant = await tx.productVariant.create({
              data: { productId: id, ...buildVariantData(variant) },
            });
            if (createdVariant.stock > 0) {
              await tx.inventoryMovement.create({
                data: {
                  variantId: createdVariant.id,
                  type: "RESTOCK",
                  quantity: createdVariant.stock,
                  reason: "Initial variant stock",
                },
              });
            }
          }
        }

        const updatedWithRelations = await tx.product.findUniqueOrThrow({
          where: { id },
          include: adminProductInclude,
        });

        await tx.auditLog.create({
          data: {
            actorId: actor.adminId,
            action: "PRODUCT_UPDATED",
            resource: "product",
            resourceId: id,
            details: buildProductUpdateDetails(existing, updatedWithRelations, input, actor.adminEmail) as Prisma.InputJsonValue,
          },
        });

        return updatedWithRelations;
      });

      return mapAdminProduct(updated);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}

function validateProductInput(input: UpsertAdminProductDto) {
  if (input.variants.length === 0) {
    throw new BadRequestException({ code: "PRODUCT_VARIANTS_REQUIRED", message: "At least one variant is required" });
  }

  const skuSet = new Set<string>();
  input.variants.forEach((variant) => {
    if (skuSet.has(variant.sku)) {
      throw new BadRequestException({ code: "DUPLICATE_SKU", message: `Duplicate SKU: ${variant.sku}` });
    }
    skuSet.add(variant.sku);
  });
}

function cleanStringList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function normalizeNullableString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function buildImageCreates(images: AdminProductImageInput[]) {
  return images.map((image, index) => ({
    url: image.url.trim(),
    alt: image.alt.trim(),
    sortOrder: image.sortOrder ?? index,
  }));
}

function buildVariantCreates(variants: AdminProductVariantInput[]) {
  return variants.map((variant) => buildVariantData(variant));
}

function buildVariantData(variant: AdminProductVariantInput) {
  return {
    sku: variant.sku.trim(),
    color: variant.color.trim(),
    size: variant.size.trim(),
    priceCents: variant.priceCents,
    compareAtPriceCents: variant.compareAtPriceCents ?? null,
    stock: variant.stock,
    lowStockThreshold: variant.lowStockThreshold ?? 5,
    weightGrams: variant.weightGrams ?? null,
    active: variant.active,
  };
}

function matchesStockFilter(
  variants: Array<{ stock: number; lowStockThreshold: number; active: boolean }>,
  stock: "in" | "low" | "out",
) {
  return variants.some((variant) => {
    if (!variant.active) return false;
    const level = getInventoryLevel(variant);
    if (stock === "in") return level === "in_stock";
    if (stock === "low") return level === "low_stock";
    return level === "out_of_stock";
  });
}

async function createInitialVariantMovements(
  tx: Prisma.TransactionClient,
  productId: string,
  actorId: string,
  variants: AdminProductVariantInput[],
) {
  const createdVariants = await tx.productVariant.findMany({ where: { productId }, select: { id: true, stock: true } });
  for (const [index, variant] of variants.entries()) {
    const createdVariant = createdVariants[index];
    if (!createdVariant || createdVariant.stock <= 0) continue;
    await tx.inventoryMovement.create({
      data: {
        variantId: createdVariant.id,
        type: "RESTOCK",
        quantity: createdVariant.stock,
        reason: "Initial variant stock",
      },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "INVENTORY_ADJUSTED",
        resource: "product_variant",
        resourceId: createdVariant.id,
        details: {
          quantityDelta: createdVariant.stock,
          reason: "Initial variant stock",
          sku: variant.sku,
        },
      },
    });
  }
}

async function writeInventoryAdjustmentAudit(
  tx: Prisma.TransactionClient,
  input: { actorId: string; variantId: string; quantityDelta: number; reason: string },
) {
  await tx.inventoryMovement.create({
    data: {
      variantId: input.variantId,
      type: "ADJUSTMENT",
      quantity: input.quantityDelta,
      reason: input.reason,
    },
  });
  await tx.auditLog.create({
    data: {
      actorId: input.actorId,
      action: "INVENTORY_ADJUSTED",
      resource: "product_variant",
      resourceId: input.variantId,
      details: {
        quantityDelta: input.quantityDelta,
        reason: input.reason,
      },
    },
  });
}

function buildProductUpdateDetails(
  previous: Prisma.ProductGetPayload<{ include: typeof adminProductInclude }>,
  next: Prisma.ProductGetPayload<{ include: typeof adminProductInclude }>,
  input: UpsertAdminProductDto,
  actorEmail: string,
) {
  const changes: Record<string, unknown> = {};
  if (previous.title !== next.title) changes.title = { from: previous.title, to: next.title };
  if (previous.status !== next.status) changes.status = { from: previous.status, to: next.status };
  if (previous.shortDescription !== next.shortDescription) changes.shortDescription = true;
  if (previous.description !== next.description) changes.description = true;
  if ((previous.seoTitle ?? null) !== (next.seoTitle ?? null)) changes.seoTitle = { from: previous.seoTitle ?? null, to: next.seoTitle ?? null };
  if ((previous.seoDescription ?? null) !== (next.seoDescription ?? null)) changes.seoDescription = { from: previous.seoDescription ?? null, to: next.seoDescription ?? null };
  if ((previous.canonicalUrl ?? null) !== (next.canonicalUrl ?? null)) changes.canonicalUrl = { from: previous.canonicalUrl ?? null, to: next.canonicalUrl ?? null };
  if ((previous.ogImageUrl ?? null) !== (next.ogImageUrl ?? null)) changes.ogImageUrl = { from: previous.ogImageUrl ?? null, to: next.ogImageUrl ?? null };

  const previousVariants = new Map(previous.variants.map((variant) => [variant.id, variant]));
  const variantChanges = input.variants
    .map((variant) => {
      if (!variant.id || !previousVariants.has(variant.id)) {
        return { sku: variant.sku, created: true, priceCents: variant.priceCents, stock: variant.stock };
      }
      const existing = previousVariants.get(variant.id)!;
      const changed: Record<string, unknown> = { sku: variant.sku };
      if (existing.priceCents !== variant.priceCents) changed.priceCents = { from: existing.priceCents, to: variant.priceCents };
      if ((existing.compareAtPriceCents ?? null) !== (variant.compareAtPriceCents ?? null)) {
        changed.compareAtPriceCents = { from: existing.compareAtPriceCents ?? null, to: variant.compareAtPriceCents ?? null };
      }
      if (existing.stock !== variant.stock) changed.stock = { from: existing.stock, to: variant.stock };
      if (existing.active !== variant.active) changed.active = { from: existing.active, to: variant.active };
      return Object.keys(changed).length > 1 ? changed : null;
    })
    .filter(Boolean);

  if (variantChanges.length > 0) changes.variants = variantChanges;

  return {
    actorEmail,
    title: next.title,
    status: next.status,
    changes,
  };
}

function mapPrismaError(error: unknown) {
  if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "P2002") {
    return new BadRequestException({ code: "UNIQUE_CONSTRAINT", message: "Slug or SKU already exists" });
  }
  return error;
}
