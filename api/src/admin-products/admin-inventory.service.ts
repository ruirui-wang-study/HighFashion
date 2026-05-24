import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { inventoryVariantInclude, mapInventoryVariant } from "./admin-product.mapper";
import { assertNextStockValue, getInventoryLevel } from "./inventory-policy";
import type { AdjustInventoryDto } from "./dto/adjust-inventory.dto";
import type { AdminInventoryQueryDto } from "./dto/admin-inventory-query.dto";

type AdminActor = {
  adminId: string;
  adminEmail: string;
};

@Injectable()
export class AdminInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminInventoryQueryDto) {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        ...(query.search
          ? {
              OR: [
                { sku: { contains: query.search, mode: "insensitive" } },
                { color: { contains: query.search, mode: "insensitive" } },
                { size: { contains: query.search, mode: "insensitive" } },
                { product: { title: { contains: query.search, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(query.productId ? { productId: query.productId } : {}),
        ...(query.category ? { product: { category: { equals: query.category, mode: "insensitive" } } } : {}),
      },
      include: inventoryVariantInclude,
      orderBy: [{ updatedAt: "desc" }, { sku: "asc" }],
    });

    const mapped = variants.map(mapInventoryVariant);
    return query.stock && query.stock !== "all"
      ? mapped.filter((variant) => {
          if (query.stock === "in") return variant.inventoryLevel === "in_stock";
          if (query.stock === "low") return variant.inventoryLevel === "low_stock";
          return variant.inventoryLevel === "out_of_stock";
        })
      : mapped;
  }

  async adjustStock(actor: AdminActor, input: AdjustInventoryDto) {
    const variant = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.productVariant.findUnique({
        where: { id: input.variantId },
        include: inventoryVariantInclude,
      });
      if (!existing) {
        throw new NotFoundException({ code: "VARIANT_NOT_FOUND", message: "Variant not found" });
      }

      const nextStock = assertNextStockValue({ currentStock: existing.stock, quantityDelta: input.quantityDelta });
      const updated = await tx.productVariant.update({
        where: { id: input.variantId },
        data: { stock: nextStock },
        include: inventoryVariantInclude,
      });
      await tx.inventoryMovement.create({
        data: {
          variantId: existing.id,
          type: "ADJUSTMENT",
          quantity: input.quantityDelta,
          reason: input.reason,
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "INVENTORY_ADJUSTED",
          resource: "product_variant",
          resourceId: existing.id,
          details: {
            actorEmail: actor.adminEmail,
            sku: existing.sku,
            previousStock: existing.stock,
            nextStock,
            quantityDelta: input.quantityDelta,
            reason: input.reason,
            inventoryLevel: getInventoryLevel(updated),
          },
        },
      });
      return updated;
    });

    return mapInventoryVariant(variant);
  }
}
