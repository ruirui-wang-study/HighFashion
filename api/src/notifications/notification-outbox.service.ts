import { Injectable } from "@nestjs/common";
import { NotificationChannel, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class NotificationOutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueueFeishu(type: string, text: string, dedupeKey?: string) {
    const payload: Prisma.InputJsonValue = { text };
    if (dedupeKey) {
      await this.prisma.notificationOutbox.upsert({
        where: { dedupeKey },
        update: {},
        create: {
          channel: NotificationChannel.FEISHU,
          type,
          dedupeKey,
          payload,
        },
      });
      return;
    }

    await this.prisma.notificationOutbox.create({
      data: {
        channel: NotificationChannel.FEISHU,
        type,
        payload,
      },
    });
  }
}

