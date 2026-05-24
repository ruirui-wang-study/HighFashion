import type { PrismaService } from "../common/prisma.service";
import { AdminInventoryService } from "./admin-inventory.service";

describe("AdminInventoryService", () => {
  it("creates an inventory movement and audit log when stock is adjusted", async () => {
    const update = jest.fn().mockResolvedValue({
      id: "variant_1",
      sku: "PG-TEST-BLK-M",
      stock: 7,
      lowStockThreshold: 5,
      updatedAt: new Date("2026-05-21T00:00:00.000Z"),
      product: { id: "product_1", title: "PulseFlex Knee Sleeve", category: "Support" },
    });
    const inventoryMovementCreate = jest.fn().mockResolvedValue({});
    const auditLogCreate = jest.fn().mockResolvedValue({});
    const findUnique = jest.fn().mockResolvedValue({
      id: "variant_1",
      sku: "PG-TEST-BLK-M",
      stock: 4,
      lowStockThreshold: 5,
      priceCents: 3200,
      compareAtPriceCents: 3800,
      color: "Graphite",
      size: "M",
      weightGrams: 220,
      active: true,
      updatedAt: new Date("2026-05-21T00:00:00.000Z"),
      product: { id: "product_1", title: "PulseFlex Knee Sleeve", category: "Support" },
    });

    const prisma = {
      $transaction: async (callback: (tx: typeof prisma) => Promise<unknown>) => callback(prisma),
      productVariant: { findUnique, update },
      inventoryMovement: { create: inventoryMovementCreate },
      auditLog: { create: auditLogCreate },
    } as unknown as PrismaService;

    const service = new AdminInventoryService(prisma);

    await service.adjustStock(
      { adminId: "admin_1", adminEmail: "admin@pulsegear.local" },
      { variantId: "variant_1", quantityDelta: 3, reason: "Cycle count correction" },
    );

    expect(update).toHaveBeenCalledWith({
      where: { id: "variant_1" },
      data: { stock: 7 },
      include: expect.any(Object),
    });
    expect(inventoryMovementCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        variantId: "variant_1",
        type: "ADJUSTMENT",
        quantity: 3,
        reason: "Cycle count correction",
      }),
    });
    expect(auditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "admin_1",
        action: "INVENTORY_ADJUSTED",
        resource: "product_variant",
        resourceId: "variant_1",
      }),
    });
  });
});
