import { ConfigService } from "@nestjs/config";
import type { PrismaService } from "../common/prisma.service";
import type { FeishuClient } from "./feishu/feishu.client";
import { OrderInventoryAlertService } from "./order-inventory-alert.service";

describe("OrderInventoryAlertService", () => {
  it("sends a Feishu alert when the order is marked SHORT", async () => {
    const sendTextMessage = jest.fn().mockResolvedValue({ delivered: false, mode: "mock" });
    const feishu = { sendTextMessage } as unknown as FeishuClient;
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

    const service = new OrderInventoryAlertService(prisma, feishu, new ConfigService({}));
    await service["deliverInventoryShortAlert"]("order_1");

    expect(sendTextMessage).toHaveBeenCalledWith(expect.stringContaining("PG1001"));
    expect(sendTextMessage).toHaveBeenCalledWith(expect.stringContaining("/admin/orders/order_1"));
  });
});
