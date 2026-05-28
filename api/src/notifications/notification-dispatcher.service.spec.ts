import { NotificationStatus } from "@prisma/client";
import type { PrismaService } from "../common/prisma.service";
import type { FeishuClient } from "./feishu/feishu.client";
import { NotificationDispatcherService } from "./notification-dispatcher.service";

describe("NotificationDispatcherService", () => {
  it("sends pending outbox messages via Feishu", async () => {
    const item = {
      id: "n1",
      channel: "FEISHU",
      status: NotificationStatus.PENDING,
      payload: { text: "hello" },
      attempts: 0,
      createdAt: new Date(),
      nextRetryAt: new Date(),
    };
    const prisma = {
      $queryRaw: jest
        .fn()
        .mockResolvedValueOnce([{ locked: true }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
      notificationOutbox: {
        findMany: jest.fn().mockResolvedValue([item]),
        findUnique: jest.fn().mockResolvedValue(item),
        update: jest.fn().mockResolvedValue({ id: "n1" }),
      },
    } as unknown as PrismaService;
    const feishu = {
      sendTextMessage: jest.fn().mockResolvedValue({ delivered: true, mode: "live" }),
    } as unknown as FeishuClient;

    const service = new NotificationDispatcherService(prisma, feishu);
    await service.dispatchPending();

    expect(feishu.sendTextMessage).toHaveBeenCalledWith("hello");
    expect(prisma.notificationOutbox.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "n1" },
        data: expect.objectContaining({ status: NotificationStatus.SENT }),
      }),
    );
  });
});

