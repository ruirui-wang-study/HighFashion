import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../common/prisma.service";
import { InventoryReservationService } from "../inventory/inventory-reservation.service";
import { OrderInventoryAlertService } from "../notifications/order-inventory-alert.service";
import { StripePaymentProvider } from "../payments/stripe-payment.provider";

const RECONCILE_INTERVAL_MS = 5 * 60 * 1000;
const RECONCILE_PENDING_AGE_MS = 2 * 60 * 1000;
const RECONCILE_BATCH_SIZE = 100;
const RECONCILE_LOCK_KEY = 84_726_102;

@Injectable()
export class OrderPaymentReconcileService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderPaymentReconcileService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripePaymentProvider,
    private readonly inventory: InventoryReservationService,
    private readonly inventoryAlerts: OrderInventoryAlertService,
  ) {}

  onModuleInit() {
    void this.reconcilePendingOrders();
    this.timer = setInterval(() => {
      void this.reconcilePendingOrders();
    }, RECONCILE_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async reconcilePendingOrders() {
    const locked = await this.tryAdvisoryLock();
    if (!locked) return;

    try {
      const cutoff = new Date(Date.now() - RECONCILE_PENDING_AGE_MS);
      const orders = await this.prisma.order.findMany({
        where: {
          status: "PENDING",
          stripeCheckoutSessionId: { not: null },
          createdAt: { lt: cutoff },
        },
        orderBy: { createdAt: "asc" },
        take: RECONCILE_BATCH_SIZE,
        include: { items: true },
      });

      for (const order of orders) {
        if (!order.stripeCheckoutSessionId) continue;
        try {
          const session = (await this.stripe.retrieveCheckoutSession(order.stripeCheckoutSessionId)) as Stripe.Checkout.Session;
          await this.applySessionState(order.id, order.orderNo, session);
        } catch (error) {
          this.logger.warn(
            JSON.stringify({
              event: "order_reconcile_session_fetch_failed",
              orderId: order.id,
              orderNo: order.orderNo,
              stripeCheckoutSessionId: order.stripeCheckoutSessionId,
              error: error instanceof Error ? error.message : String(error),
            }),
          );
        }
      }
    } finally {
      await this.releaseAdvisoryLock();
    }
  }

  private async applySessionState(orderId: string, orderNo: string, session: Stripe.Checkout.Session) {
    if (session.payment_status === "paid") {
      const result = await this.prisma.$transaction(async (tx) => {
        const current = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!current || current.status === "PAID") return { changed: false, inventoryShort: false };

        const updateResult = await tx.order.updateMany({
          where: { id: orderId, status: { not: "PAID" } },
          data: {
            status: "PAID",
            paymentStatus: PaymentStatus.PAID,
            stripePaymentIntentId: getPaymentIntentId(session),
            paymentMethodType: session.payment_method_types?.[0] ?? null,
            email: session.customer_details?.email ?? session.customer_email ?? current.email,
          },
        });
        if (updateResult.count === 0) return { changed: false, inventoryShort: false };

        await tx.orderStatusEvent.create({
          data: {
            orderId,
            type: "PAYMENT_STATUS_CHANGED",
            fromValue: current.paymentStatus,
            toValue: PaymentStatus.PAID,
            details: {
              source: "order-payment-reconcile",
              stripeCheckoutSessionId: session.id ?? null,
              stripePaymentIntentId: getPaymentIntentId(session),
            },
          },
        });

        const { inventoryShort } = await this.inventory.confirmForOrder(tx, current);
        return { changed: true, inventoryShort };
      });

      if (result.changed) {
        this.logger.log(JSON.stringify({ event: "order_reconciled_paid", orderId, orderNo, inventoryShort: result.inventoryShort }));
      }
      if (result.inventoryShort) {
        this.inventoryAlerts.notifyInventoryShort(orderId);
      }
      return;
    }

    if (session.status === "expired") {
      const changed = await this.prisma.$transaction(async (tx) => {
        const current = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!current || current.status === "PAID" || current.status === "EXPIRED") return false;

        await this.inventory.releaseForOrder(tx, current, `Reconciled expired session for ${orderNo}`);
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "EXPIRED",
            stripePaymentIntentId: getPaymentIntentId(session),
            email: session.customer_details?.email ?? session.customer_email ?? current.email,
          },
        });
        await tx.orderStatusEvent.create({
          data: {
            orderId,
            type: "ORDER_STATUS_CHANGED",
            fromValue: current.status,
            toValue: "EXPIRED",
            details: {
              source: "order-payment-reconcile",
              stripeCheckoutSessionId: session.id ?? null,
              reason: "stripe_session_expired",
            },
          },
        });
        return true;
      });
      if (changed) {
        this.logger.log(JSON.stringify({ event: "order_reconciled_expired", orderId, orderNo }));
      }
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

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  if (!session.payment_intent) return null;
  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
}

