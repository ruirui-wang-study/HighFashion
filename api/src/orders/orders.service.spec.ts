import type { PrismaService } from "../common/prisma.service";
import { OrdersService } from "./orders.service";

describe("OrdersService", () => {
  it("returns storefront order detail with status events for session lookups", async () => {
    const record = {
      id: "order_1",
      orderNo: "PG1001",
      email: "runner@example.com",
      status: "PAID",
      createdAt: new Date("2026-05-24T08:00:00.000Z"),
      paymentStatus: "PAID",
      fulfillmentStatus: "UNFULFILLED",
      fulfilledAt: null,
      currency: "usd",
      subtotalCents: 3400,
      shippingCents: 699,
      discountCents: 0,
      totalCents: 4099,
      stripeCheckoutSessionId: "cs_test_123",
      stripePaymentIntentId: "pi_test_123",
      paymentMethodType: "card",
      customerCountry: "US",
      shippingAddress: null,
      billingAddress: null,
      items: [
        {
          id: "item_1",
          titleSnapshot: "PulseFlex Knee Sleeve",
          skuSnapshot: "PG-PKS-GRA-L",
          colorSnapshot: "Graphite",
          sizeSnapshot: "L",
          quantity: 1,
          unitPriceCents: 3400,
          lineTotalCents: 3400,
        },
      ],
      statusEvents: [
        {
          id: "event_1",
          type: "PAYMENT_STATUS_CHANGED",
          fromValue: "PENDING",
          toValue: "PAID",
          details: { source: "stripe-webhook" },
          createdAt: new Date("2026-05-24T08:01:00.000Z"),
          createdByAdmin: null,
        },
      ],
    };

    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue(record),
      },
    } as unknown as PrismaService;

    const service = new OrdersService(prisma);
    const result = await service.findBySession("cs_test_123");

    expect((prisma.order.findUnique as jest.Mock).mock.calls[0][0]).toEqual({
      where: { stripeCheckoutSessionId: "cs_test_123" },
      include: expect.objectContaining({
        items: { orderBy: { id: "asc" } },
        statusEvents: expect.any(Object),
      }),
    });
    expect(result.statusEvents).toEqual([
      {
        id: "event_1",
        type: "PAYMENT_STATUS_CHANGED",
        fromValue: "PENDING",
        toValue: "PAID",
        details: { source: "stripe-webhook" },
        createdAt: "2026-05-24T08:01:00.000Z",
        createdByAdmin: null,
      },
    ]);
  });
});
