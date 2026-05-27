import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { InventoryReservationService } from "../inventory/inventory-reservation.service";

export const PENDING_ORDER_TTL_MS = 30 * 60 * 1000;
const EXPIRY_INTERVAL_MS = 15 * 60 * 1000;
const EXPIRY_LOCK_KEY = 84_726_101;

@Injectable()
export class OrderMaintenanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderMaintenanceService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryReservationService,
  ) {}

  onModuleInit() {
    void this.expireStalePendingOrders();
    this.timer = setInterval(() => {
      void this.expireStalePendingOrders();
    }, EXPIRY_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async expireStalePendingOrders() {
    const locked = await this.tryAdvisoryLock();
    if (!locked) return;

    try {
      const cutoff = new Date(Date.now() - PENDING_ORDER_TTL_MS);
      const orders = await this.prisma.order.findMany({
        where: {
          status: "PENDING",
          createdAt: { lt: cutoff },
        },
        include: { items: true },
      });

      for (const order of orders) {
        await this.prisma.$transaction(async (tx) => {
          const current = await tx.order.findUnique({ where: { id: order.id } });
          if (!current || current.status !== "PENDING") return;

          await this.inventory.releaseForOrder(tx, order, `Pending order expired (${order.orderNo})`);
          await tx.order.update({
            where: { id: order.id },
            data: { status: "EXPIRED" },
          });
          await tx.orderStatusEvent.create({
            data: {
              orderId: order.id,
              type: "ORDER_STATUS_CHANGED",
              fromValue: "PENDING",
              toValue: "EXPIRED",
              details: { source: "order-maintenance", reason: "reservation_ttl_exceeded" },
            },
          });
        });
      }

      if (orders.length > 0) {
        this.logger.log(`Expired ${orders.length} stale pending order(s)`);
      }
    } finally {
      await this.releaseAdvisoryLock();
    }
  }

  private async tryAdvisoryLock() {
    const rows = await this.prisma.$queryRaw<{ locked: boolean }[]>`
      SELECT pg_try_advisory_lock(${EXPIRY_LOCK_KEY}) AS locked
    `;
    return rows[0]?.locked === true;
  }

  private async releaseAdvisoryLock() {
    await this.prisma.$queryRaw`SELECT pg_advisory_unlock(${EXPIRY_LOCK_KEY})`;
  }
}
