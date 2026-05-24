import { FulfillmentStatus, PaymentStatus } from "@prisma/client";
import type { PrismaService } from "../common/prisma.service";
import { AdminOrdersService } from "./admin-orders.service";

describe("AdminOrdersService", () => {
  const actor = { adminId: "admin_1", adminEmail: "admin@pulsegear.local" };

  function createPrismaMock() {
    const detailRecord = {
      id: "order_1",
      orderNo: "PG1001",
      email: "runner@example.com",
      status: "PAID",
      paymentStatus: PaymentStatus.PAID,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      fulfilledAt: null,
      currency: "usd",
      subtotalCents: 12000,
      shippingCents: 0,
      discountCents: 0,
      totalCents: 12000,
      stripeCheckoutSessionId: "cs_test_123",
      stripePaymentIntentId: "pi_test_123",
      paymentMethodType: "card",
      customerCountry: "US",
      shippingAddress: { name: "Runner", address: { line1: "123 Main", city: "Austin", state: "TX", postal_code: "78701", country: "US" } },
      billingAddress: { email: "runner@example.com" },
      createdAt: new Date("2026-05-22T00:00:00.000Z"),
      updatedAt: new Date("2026-05-22T00:00:00.000Z"),
      items: [
        {
          id: "item_1",
          titleSnapshot: "PulseFlex Knee Sleeve",
          skuSnapshot: "PG-PFK-GRA-M",
          colorSnapshot: "Graphite",
          sizeSnapshot: "M",
          quantity: 2,
          unitPriceCents: 6000,
          lineTotalCents: 12000,
        },
      ],
      notes: [
        {
          id: "note_1",
          note: "VIP runner",
          createdAt: new Date("2026-05-22T01:00:00.000Z"),
          createdByAdmin: { id: "admin_1", name: "Admin User", email: "admin@pulsegear.local" },
        },
      ],
      statusEvents: [
        {
          id: "event_1",
          type: "PAYMENT_STATUS_CHANGED",
          fromValue: "PENDING",
          toValue: "PAID",
          details: { source: "stripe-webhook" },
          createdAt: new Date("2026-05-22T00:05:00.000Z"),
          createdByAdmin: null,
        },
      ],
    };

    const tx = {
      order: {
        findMany: jest.fn().mockResolvedValue([detailRecord]),
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(detailRecord)
          .mockResolvedValueOnce({
            ...detailRecord,
            status: "FULFILLED",
            fulfillmentStatus: FulfillmentStatus.FULFILLED,
            fulfilledAt: new Date("2026-05-22T02:00:00.000Z"),
            statusEvents: [
              {
                id: "event_2",
                type: "FULFILLMENT_STATUS_CHANGED",
                fromValue: "UNFULFILLED",
                toValue: "FULFILLED",
                details: { actorEmail: "admin@pulsegear.local" },
                createdAt: new Date("2026-05-22T02:00:00.000Z"),
                createdByAdmin: { id: "admin_1", name: "Admin User", email: "admin@pulsegear.local" },
              },
              ...detailRecord.statusEvents,
            ],
          }),
        update: jest.fn().mockResolvedValue({
          ...detailRecord,
          status: "FULFILLED",
          fulfillmentStatus: FulfillmentStatus.FULFILLED,
          fulfilledAt: new Date("2026-05-22T02:00:00.000Z"),
        }),
      },
      orderNote: {
        create: jest.fn().mockResolvedValue({
          id: "note_2",
          note: "Pack with extra care",
          createdAt: new Date("2026-05-22T02:00:00.000Z"),
          createdByAdmin: { id: "admin_1", name: "Admin User", email: "admin@pulsegear.local" },
        }),
      },
      orderStatusEvent: {
        create: jest.fn().mockResolvedValue({}),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const prisma = {
      ...tx,
      $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    } as unknown as PrismaService;

    return { prisma, tx, detailRecord };
  }

  it("lists orders with formal payment and fulfillment statuses", async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new AdminOrdersService(prisma);

    const result = await service.findAll({
      search: "PG1001",
      paymentStatus: PaymentStatus.PAID,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      dateFrom: "2026-05-20",
      dateTo: "2026-05-22",
    });

    expect(tx.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        paymentStatus: PaymentStatus.PAID,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      }),
    }));
    expect(result[0]).toEqual(expect.objectContaining({
      orderNo: "PG1001",
      paymentStatus: PaymentStatus.PAID,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
    }));
  });

  it("returns order detail with items, notes, status events, and stripe IDs", async () => {
    const { prisma } = createPrismaMock();
    const service = new AdminOrdersService(prisma);

    const result = await service.findById("order_1");

    expect(result).toEqual(expect.objectContaining({
      id: "order_1",
      stripeCheckoutSessionId: "cs_test_123",
      stripePaymentIntentId: "pi_test_123",
      paymentStatus: PaymentStatus.PAID,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
    }));
    expect(result.items).toHaveLength(1);
    expect(result.notes).toHaveLength(1);
    expect(result.statusEvents).toHaveLength(1);
  });

  it("adds order notes and writes an audit log", async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new AdminOrdersService(prisma);

    await service.addNote("order_1", actor, { note: "Pack with extra care" });

    expect(tx.orderNote.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: "order_1",
        note: "Pack with extra care",
        createdByAdminId: actor.adminId,
      }),
      include: expect.any(Object),
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: actor.adminId,
        action: "ORDER_NOTE_ADDED",
        resource: "order",
        resourceId: "order_1",
      }),
    });
  });

  it("marks orders fulfilled and writes status event plus audit log", async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new AdminOrdersService(prisma);

    const result = await service.markFulfilled("order_1", actor);

    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: expect.objectContaining({
        status: "FULFILLED",
        fulfillmentStatus: FulfillmentStatus.FULFILLED,
      }),
      include: expect.any(Object),
    });
    expect(tx.orderStatusEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: "order_1",
        type: "FULFILLMENT_STATUS_CHANGED",
        fromValue: FulfillmentStatus.UNFULFILLED,
        toValue: FulfillmentStatus.FULFILLED,
      }),
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: actor.adminId,
        action: "ORDER_FULFILLED",
        resourceId: "order_1",
      }),
    });
    expect(result.fulfillmentStatus).toBe(FulfillmentStatus.FULFILLED);
  });
});
