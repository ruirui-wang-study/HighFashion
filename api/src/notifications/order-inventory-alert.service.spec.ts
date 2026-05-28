import { ConfigService } from "@nestjs/config";
import type { PrismaService } from "../common/prisma.service";
import type { NotificationOutboxService } from "./notification-outbox.service";
import { OrderInventoryAlertService } from "./order-inventory-alert.service";

describe("OrderInventoryAlertService", () => {
  it("sends a Feishu alert when the order is marked SHORT", async () => {
    const enqueueFeishu = jest.fn().mockResolvedValue(undefined);
    const outbox = { enqueueFeishu } as unknown as NotificationOutboxService;
    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue({
          id: "order_1",
          orderNo: "PG1001",
          email: "runner@example.com",
          totalCents: 4099,
          currency: "usd",
          inventoryStatus: "SHORT",
          items: [
            {
              titleSnapshot: "Run Belt",
              colorSnapshot: "Graphite",
              sizeSnapshot: "M",
              quantity: 1,
              skuSnapshot: "PG-BELT-M",
            },
          ],
        }),
      },
      adminSettings: {
        findUnique: jest.fn().mockResolvedValue({ storefrontUrl: "http://localhost:3000" }),
      },
    } as unknown as PrismaService;

    const service = new OrderInventoryAlertService(prisma, outbox, new ConfigService({}));
    await service["deliverInventoryShortAlert"]("order_1");

    expect(enqueueFeishu).toHaveBeenCalledWith(
      "inventory.short",
      expect.stringContaining("PG1001"),
      "inventory-short:order_1",
    );
    expect(enqueueFeishu).toHaveBeenCalledWith(
      "inventory.short",
      expect.stringContaining("/admin/orders/order_1"),
      "inventory-short:order_1",
    );
  });

  it("sends a Feishu alert when inventory drift is reconciled", async () => {
    const enqueueFeishu = jest.fn().mockResolvedValue(undefined);
    const outbox = { enqueueFeishu } as unknown as NotificationOutboxService;
    const prisma = {
      adminSettings: {
        findUnique: jest.fn().mockResolvedValue({ storefrontUrl: "http://localhost:3000" }),
      },
      order: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    const service = new OrderInventoryAlertService(prisma, outbox, new ConfigService({}));
    await service["deliverInventoryDriftAlert"]([{ variantId: "variant_1", from: 3, to: 1 }]);

    expect(enqueueFeishu).toHaveBeenCalledWith(
      "inventory.drift",
      expect.stringContaining("reservedStock 漂移"),
      expect.stringContaining("inventory-drift:"),
    );
    expect(enqueueFeishu).toHaveBeenCalledWith(
      "inventory.drift",
      expect.stringContaining("variant_1"),
      expect.stringContaining("inventory-drift:"),
    );
  });
});
