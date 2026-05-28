import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { FeishuClient } from "./feishu/feishu.client";

const DISPATCH_INTERVAL_MS = 15 * 1000;
const DISPATCH_BATCH_SIZE = 50;
const DISPATCH_LOCK_KEY = 84_726_104;
const MAX_ATTEMPTS = 10;

type OutboxPayload = {
  text?: string;
};

@Injectable()
export class NotificationDispatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationDispatcherService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly feishu: FeishuClient,
  ) {}

  onModuleInit() {
    void this.dispatchPending();
    this.timer = setInterval(() => {
      void this.dispatchPending();
    }, DISPATCH_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async dispatchPending() {
    const locked = await this.tryAdvisoryLock();
    if (!locked) return;

    try {
      const pending = await this.prisma.notificationOutbox.findMany({
        where: {
          status: NotificationStatus.PENDING,
          nextRetryAt: { lte: new Date() },
        },
        orderBy: { createdAt: "asc" },
        take: DISPATCH_BATCH_SIZE,
      });

      for (const item of pending) {
        await this.dispatchOne(item.id);
      }
    } finally {
      await this.releaseAdvisoryLock();
    }
  }

  private async dispatchOne(id: string) {
    const current = await this.prisma.notificationOutbox.findUnique({ where: { id } });
    if (!current || current.status !== NotificationStatus.PENDING) return;

    try {
      if (current.channel === NotificationChannel.FEISHU) {
        const payload = current.payload as OutboxPayload;
        if (!payload.text) throw new Error("Outbox payload missing text");
        await this.feishu.sendTextMessage(payload.text);
      }

      await this.prisma.notificationOutbox.update({
        where: { id: current.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
          attempts: { increment: 1 },
          lastError: null,
        },
      });
    } catch (error) {
      const attempts = current.attempts + 1;
      const lastError = error instanceof Error ? error.message : String(error);
      const shouldGiveUp = attempts >= MAX_ATTEMPTS;
      const retrySeconds = Math.min(300, Math.max(10, Math.pow(2, attempts) * 5));
      await this.prisma.notificationOutbox.update({
        where: { id: current.id },
        data: {
          attempts,
          lastError,
          status: shouldGiveUp ? NotificationStatus.FAILED : NotificationStatus.PENDING,
          nextRetryAt: shouldGiveUp ? new Date() : new Date(Date.now() + retrySeconds * 1000),
        },
      });
      this.logger.warn(
        JSON.stringify({
          event: "notification_dispatch_failed",
          outboxId: current.id,
          attempts,
          failed: shouldGiveUp,
          error: lastError,
        }),
      );
    }
  }

  private async tryAdvisoryLock() {
    const rows = await this.prisma.$queryRaw<{ locked: boolean }[]>`
      SELECT pg_try_advisory_lock(${DISPATCH_LOCK_KEY}) AS locked
    `;
    return rows[0]?.locked === true;
  }

  private async releaseAdvisoryLock() {
    await this.prisma.$queryRaw`SELECT pg_advisory_unlock(${DISPATCH_LOCK_KEY})`;
  }
}

