import type { PrismaService } from "../common/prisma.service";
import type { OrderInventoryAlertService } from "../notifications/order-inventory-alert.service";
import { InventoryReconcileService } from "./inventory-reconcile.service";

describe("InventoryReconcileService", () => {
  it("reconciles reservedStock drift based on movements", async () => {
    const prisma = {
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce([{ locked: true }])
        .mockResolvedValueOnce([
          {
            variantId: "variant_1",
            currentReservedStock: 3,
            expectedReservedStock: 1,
          },
        ])
        .mockResolvedValueOnce([]),
      productVariant: {
        update: jest.fn().mockResolvedValue({ id: "variant_1" }),
      },
    } as unknown as PrismaService;
    const alerts = {
      notifyInventoryDrift: jest.fn(),
    } as unknown as OrderInventoryAlertService;

    const service = new InventoryReconcileService(prisma, alerts);
    await service.reconcileReservedStock();

    expect(prisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: "variant_1" },
      data: { reservedStock: 1 },
    });
    expect(alerts.notifyInventoryDrift).toHaveBeenCalledWith([{ variantId: "variant_1", from: 3, to: 1 }]);
  });
});

