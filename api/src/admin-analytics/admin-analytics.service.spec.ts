import type { PrismaService } from "../common/prisma.service";
import { AdminAnalyticsService } from "./admin-analytics.service";

function createPrismaMock(overrides?: {
  orders?: unknown[];
  variants?: unknown[];
  pendingOver30m?: number;
  shortOrders?: number;
  successEvents24h?: number;
  handledEvents24h?: number;
}) {
  const orders = (overrides?.orders ?? []) as Array<{ status: string }>;
  const variants = overrides?.variants ?? [];
  const pendingOver30m = overrides?.pendingOver30m ?? 0;
  const shortOrders = overrides?.shortOrders ?? 0;
  const successEvents24h = overrides?.successEvents24h ?? 0;
  const handledEvents24h = overrides?.handledEvents24h ?? 0;

  return {
    order: {
      findMany: jest.fn().mockImplementation(({ where }: { where?: { status?: { in?: string[] } } }) => {
        const allowed = where?.status?.in ?? [];
        return Promise.resolve(orders.filter((order) => allowed.length === 0 || allowed.includes(order.status)));
      }),
      count: jest.fn().mockImplementation(({ where }: { where?: { status?: string; inventoryStatus?: string } }) => {
        if (where?.status === "PENDING") return Promise.resolve(pendingOver30m);
        if (where?.inventoryStatus === "SHORT") return Promise.resolve(shortOrders);
        return Promise.resolve(0);
      }),
    },
    paymentEvent: {
      count: jest.fn().mockImplementation(({ where }: { where?: { type?: { in?: string[] } } }) => {
        const types = where?.type?.in ?? [];
        const successTypes = ["checkout.session.completed", "checkout.session.async_payment_succeeded"];
        const isSuccessCounter = types.every((type) => successTypes.includes(type));
        return Promise.resolve(isSuccessCounter ? successEvents24h : handledEvents24h);
      }),
    },
    productVariant: {
      findMany: jest.fn().mockResolvedValue(variants),
    },
  } as unknown as PrismaService;
}

describe("AdminAnalyticsService", () => {
  it("returns zero-safe dashboard metrics and disconnected GA4 fallback when there are no orders", async () => {
    const prisma = createPrismaMock();
    const service = new AdminAnalyticsService(prisma);

    const result = await service.getDashboardAnalytics(7);

    expect(result.summary.gmvCents).toBe(0);
    expect(result.summary.orders).toBe(0);
    expect(result.summary.aovCents).toBe(0);
    expect(result.summary.conversionRate).toBe(0);
    expect(result.opsHealth).toEqual({
      pendingOver30m: 0,
      shortOrders: 0,
      webhookSuccessRate24h: 0,
    });
    expect(result.ga4.connected).toBe(false);
    expect(result.ga4.status).toBe("Not Connected");
    expect(result.topProducts).toEqual([]);
    expect(result.recentOrders).toEqual([]);
  });

  it("aggregates GMV, orders, AOV, countries, top products, and purchases from paid and fulfilled orders only", async () => {
    const prisma = createPrismaMock({
      orders: [
        {
          id: "order_1",
          orderNo: "PG1001",
          status: "PAID",
          totalCents: 12000,
          customerCountry: "US",
          createdAt: new Date("2026-05-20T10:00:00.000Z"),
          items: [
            {
              productId: "product_1",
              titleSnapshot: "PulseFlex Knee Sleeve",
              quantity: 2,
              lineTotalCents: 8000,
            },
            {
              productId: "product_2",
              titleSnapshot: "CourtGrip Socks",
              quantity: 1,
              lineTotalCents: 4000,
            },
          ],
        },
        {
          id: "order_2",
          orderNo: "PG1002",
          status: "FULFILLED",
          totalCents: 6000,
          customerCountry: "CA",
          createdAt: new Date("2026-05-19T10:00:00.000Z"),
          items: [
            {
              productId: "product_2",
              titleSnapshot: "CourtGrip Socks",
              quantity: 3,
              lineTotalCents: 6000,
            },
          ],
        },
        {
          id: "order_3",
          orderNo: "PG1003",
          status: "PENDING",
          totalCents: 9999,
          customerCountry: "US",
          createdAt: new Date("2026-05-18T10:00:00.000Z"),
          items: [
            {
              productId: "product_3",
              titleSnapshot: "Ignored Pending Product",
              quantity: 1,
              lineTotalCents: 9999,
            },
          ],
        },
      ],
      variants: [
        {
          id: "variant_1",
          sku: "PG-FLEX-GR-M",
          stock: 4,
          lowStockThreshold: 5,
          active: true,
          product: {
            id: "product_1",
            title: "PulseFlex Knee Sleeve",
            slug: "pulseflex-knee-sleeve",
          },
        },
      ],
      pendingOver30m: 3,
      shortOrders: 1,
      successEvents24h: 9,
      handledEvents24h: 12,
    });
    const service = new AdminAnalyticsService(prisma);

    const dashboard = await service.getDashboardAnalytics(7);
    const sales = await service.getSalesAnalytics(7);
    const products = await service.getProductAnalytics(7);
    const funnel = await service.getFunnelAnalytics(7);

    expect(dashboard.summary.gmvCents).toBe(18000);
    expect(dashboard.summary.orders).toBe(2);
    expect(dashboard.summary.aovCents).toBe(9000);
    expect(dashboard.lowStockAlerts).toHaveLength(1);
    expect(dashboard.topProducts.map((item: { productTitle: string }) => item.productTitle)).toEqual([
      "CourtGrip Socks",
      "PulseFlex Knee Sleeve",
    ]);
    expect(dashboard.opsHealth).toEqual({
      pendingOver30m: 3,
      shortOrders: 1,
      webhookSuccessRate24h: 0.75,
    });

    expect(sales.salesByCountry).toEqual([
      { country: "US", revenueCents: 12000, orders: 1 },
      { country: "CA", revenueCents: 6000, orders: 1 },
    ]);

    expect(products.summary.purchases).toBe(2);
    expect(products.revenueByProduct[0]).toEqual(
      expect.objectContaining({
        productTitle: "CourtGrip Socks",
        revenueCents: 10000,
        purchases: 2,
        unitsSold: 4,
      }),
    );

    expect(funnel.steps.at(-1)).toEqual(
      expect.objectContaining({
        key: "purchase",
        value: 2,
      }),
    );
  });
});
