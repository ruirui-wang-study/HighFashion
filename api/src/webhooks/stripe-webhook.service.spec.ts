import { PaymentStatus } from "@prisma/client";
import Stripe from "stripe";
import type { PrismaService } from "../common/prisma.service";
import type { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { StripeWebhookService } from "./stripe-webhook.service";

describe("StripeWebhookService", () => {
  function createDependencies() {
    const order = {
      id: "order_1",
      orderNo: "PG1001",
      email: "runner@example.com",
      status: "PENDING",
      paymentStatus: PaymentStatus.PENDING,
      customerCountry: null,
      items: [
        {
          id: "item_1",
          variantId: "variant_1",
          quantity: 2,
        },
      ],
    };

    const tx = {
      order: {
        findUnique: jest.fn().mockResolvedValue(order),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      paymentEvent: {
        create: jest.fn().mockResolvedValue({ id: "payment_event_1" }),
      },
      productVariant: {
        update: jest.fn().mockResolvedValue({ id: "variant_1" }),
      },
      inventoryMovement: {
        create: jest.fn().mockResolvedValue({ id: "inventory_1" }),
      },
      orderStatusEvent: {
        create: jest.fn().mockResolvedValue({ id: "status_event_1" }),
      },
    };

    const prisma = {
      $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    } as unknown as PrismaService;

    const stripe = {
      constructWebhookEvent: jest.fn(),
      retrievePaymentIntentMethodType: jest.fn().mockResolvedValue("card"),
    } as unknown as StripePaymentProvider;

    return { order, tx, prisma, stripe };
  }

  it("marks successful checkout sessions as paid and records a payment status event", async () => {
    const { tx, prisma, stripe } = createDependencies();
    const service = new StripeWebhookService(prisma, stripe);
    const session = {
      id: "cs_test_123",
      metadata: { orderId: "order_1", orderNo: "PG1001" },
      payment_intent: "pi_test_123",
      payment_method_types: ["card"],
      customer_details: {
        email: "runner@example.com",
        address: {
          line1: "123 Main",
          city: "Austin",
          state: "TX",
          postal_code: "78701",
          country: "US",
        },
      },
      collected_information: {
        shipping_details: {
          name: "Runner Test",
          address: {
            line1: "123 Main",
            city: "Austin",
            state: "TX",
            postal_code: "78701",
            country: "US",
          },
        },
      },
    } as unknown as Stripe.Checkout.Session;

    (stripe.constructWebhookEvent as jest.Mock).mockReturnValue({
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: session },
    } as Stripe.Event);

    await service.handle(Buffer.from("payload"), "signature");

    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { id: "order_1", status: { not: "PAID" } },
      data: expect.objectContaining({
        status: "PAID",
        paymentStatus: PaymentStatus.PAID,
        stripePaymentIntentId: "pi_test_123",
        paymentMethodType: "card",
      }),
    });
    expect(tx.orderStatusEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: "order_1",
        type: "PAYMENT_STATUS_CHANGED",
        fromValue: PaymentStatus.PENDING,
        toValue: PaymentStatus.PAID,
      }),
    });
  });
});
