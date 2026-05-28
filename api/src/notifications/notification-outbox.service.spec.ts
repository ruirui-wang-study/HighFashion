import { NotificationChannel } from "@prisma/client";
import type { PrismaService } from "../common/prisma.service";
import { NotificationOutboxService } from "./notification-outbox.service";

describe("NotificationOutboxService", () => {
  it("upserts deduped Feishu notifications", async () => {
    const prisma = {
      notificationOutbox: {
        upsert: jest.fn().mockResolvedValue({ id: "n1" }),
      },
    } as unknown as PrismaService;
    const service = new NotificationOutboxService(prisma);
    await service.enqueueFeishu("inventory.short", "hello", "k1");

    expect(prisma.notificationOutbox.upsert).toHaveBeenCalledWith({
      where: { dedupeKey: "k1" },
      update: {},
      create: {
        channel: NotificationChannel.FEISHU,
        type: "inventory.short",
        dedupeKey: "k1",
        payload: { text: "hello" },
      },
    });
  });
});

