import { PaymentStatus } from "@prisma/client";
import type { PrismaService } from "../common/prisma.service";
import type { InventoryReservationService } from "../inventory/inventory-reservation.service";
import type { OrderInventoryAlertService } from "../notifications/order-inventory-alert.service";
import type { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { OrderPaymentReconcileService } from "./order-payment-reconcile.service";

describe("OrderPaymentReconcileService", () => {
  it("marks pending order as PAID when Stripe session is paid", async () => {
    const order = {
      id: "order_1",
      orderNo: "PG1001",
      status: "PENDING",
      paymentStatus: PaymentStatus.PENDING,
      email: "runner@example.com",
      stripeCheckoutSessionId: "cs_test_123",
      items: [{ variantId: "variant_1", quantity: 1 }],
      createdAt: new Date("2026-05-28T00:00:00.000Z"),
    };
    const tx = {
      order: {
        findUnique: jest.fn().mockResolvedValue(order),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      orderStatusEvent: {
        create: jest.fn().mockResolvedValue({ id: "event_1" }),
      },
    };
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ locked: true }]),
      order: {
        findMany: jest.fn().mockResolvedValue([order]),
      },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    } as unknown as PrismaService;
    const stripe = {
      retrieveCheckoutSession: jest.fn().mockResolvedValue({
        id: "cs_test_123",
        status: "complete",
        payment_status: "paid",
        payment_intent: "pi_test_123",
        payment_method_types: ["card"],
        customer_details: { email: "runner@example.com" },
      }),
    } as unknown as StripePaymentProvider;
    const inventory = {
      confirmForOrder: jest.fn().mockResolvedValue({ inventoryShort: false }),
      releaseForOrder: jest.fn(),
    } as unknown as InventoryReservationService;
    const alerts = {
      notifyInventoryShort: jest.fn(),
    } as unknown as OrderInventoryAlertService;

    const service = new OrderPaymentReconcileService(prisma, stripe, inventory, alerts);
    await service.reconcilePendingOrders();

    expect(stripe.retrieveCheckoutSession).toHaveBeenCalledWith("cs_test_123");
    expect(tx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order_1", status: { not: "PAID" } },
        data: expect.objectContaining({ status: "PAID", paymentStatus: PaymentStatus.PAID }),
      }),
    );
    expect(inventory.confirmForOrder).toHaveBeenCalledWith(tx, expect.objectContaining({ id: "order_1" }));
    expect(alerts.notifyInventoryShort).not.toHaveBeenCalled();
  });
});

