import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { OrderInventoryAlertService } from "../notifications/order-inventory-alert.service";

const RECONCILE_INTERVAL_MS = 60 * 60 * 1000;
const RECONCILE_BATCH_SIZE = 200;
const RECONCILE_LOCK_KEY = 84_726_103;

type DriftRow = {
  variantId: string;
  currentReservedStock: number;
  expectedReservedStock: number;
};

@Injectable()
export class InventoryReconcileService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InventoryReconcileService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: OrderInventoryAlertService,
  ) {}

  onModuleInit() {
    void this.reconcileReservedStock();
    this.timer = setInterval(() => {
      void this.reconcileReservedStock();
    }, RECONCILE_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async reconcileReservedStock() {
    const locked = await this.tryAdvisoryLock();
    if (!locked) return;

    try {
      const drifts = await this.prisma.$queryRaw<DriftRow[]>`
        WITH movement_expected AS (
          SELECT
            "variantId" AS "variantId",
            GREATEST(0, COALESCE(SUM(
              CASE
                WHEN "type" = 'RESERVATION' THEN "quantity"
                WHEN "type" = 'RELEASE' THEN -("quantity")
                WHEN "type" = 'SALE' THEN "quantity"
                ELSE 0
              END
            ), 0))::INTEGER AS "expectedReservedStock"
          FROM "InventoryMovement"
          GROUP BY "variantId"
        )
        SELECT
          pv."id" AS "variantId",
          pv."reservedStock"::INTEGER AS "currentReservedStock",
          COALESCE(me."expectedReservedStock", 0)::INTEGER AS "expectedReservedStock"
        FROM "ProductVariant" pv
        LEFT JOIN movement_expected me
          ON me."variantId" = pv."id"
        WHERE pv."reservedStock" <> COALESCE(me."expectedReservedStock", 0)
        ORDER BY pv."updatedAt" DESC
        LIMIT ${RECONCILE_BATCH_SIZE}
      `;

      for (const row of drifts) {
        await this.prisma.productVariant.update({
          where: { id: row.variantId },
          data: { reservedStock: row.expectedReservedStock },
        });
        this.logger.warn(
          JSON.stringify({
            event: "inventory_reserved_stock_reconciled",
            variantId: row.variantId,
            from: row.currentReservedStock,
            to: row.expectedReservedStock,
          }),
        );
      }

      if (drifts.length > 0) {
        this.logger.log(JSON.stringify({ event: "inventory_reconcile_applied", count: drifts.length }));
        this.alerts.notifyInventoryDrift(
          drifts.map((row) => ({ variantId: row.variantId, from: row.currentReservedStock, to: row.expectedReservedStock })),
        );
      }
    } finally {
      await this.releaseAdvisoryLock();
    }
  }

  private async tryAdvisoryLock() {
    const rows = await this.prisma.$queryRaw<{ locked: boolean }[]>`
      SELECT pg_try_advisory_lock(${RECONCILE_LOCK_KEY}) AS locked
    `;
    return rows[0]?.locked === true;
  }

  private async releaseAdvisoryLock() {
    await this.prisma.$queryRaw`SELECT pg_advisory_unlock(${RECONCILE_LOCK_KEY})`;
  }
}

