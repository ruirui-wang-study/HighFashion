import { Injectable } from "@nestjs/common";
import type { OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { AdminAnalyticsMockProvider } from "./admin-analytics.mock-provider";
import type {
  DashboardAnalyticsResponse,
  DashboardTopProduct,
  FunnelAnalyticsResponse,
  FunnelStep,
  ProductAnalyticsResponse,
  SalesAnalyticsResponse,
} from "./admin-analytics.types";

const paidStatuses: OrderStatus[] = ["PAID", "FULFILLED"];

const analyticsOrderInclude = {
  items: {
    select: {
      productId: true,
      titleSnapshot: true,
      quantity: true,
      lineTotalCents: true,
    },
  },
} satisfies Prisma.OrderInclude;

type AnalyticsOrderRecord = Prisma.OrderGetPayload<{ include: typeof analyticsOrderInclude }>;

const lowStockVariantInclude = {
  product: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductVariantInclude;

type LowStockVariantRecord = Prisma.ProductVariantGetPayload<{ include: typeof lowStockVariantInclude }>;

@Injectable()
export class AdminAnalyticsService {
  private readonly mockProvider = new AdminAnalyticsMockProvider();

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDashboardAnalytics(days: number): Promise<DashboardAnalyticsResponse> {
    const [orders, lowStockAlerts] = await Promise.all([
      this.loadOrders(days),
      this.loadLowStockAlerts(),
    ]);
    const aggregates = aggregateOrders(orders);
    const behavior = this.mockProvider.getBehaviorMetrics(days);
    const ga4 = this.mockProvider.getConnectionStatus();

    return {
      rangeDays: days,
      ga4,
      summary: {
        gmvCents: aggregates.gmvCents,
        orders: aggregates.orders,
        aovCents: aggregates.aovCents,
        conversionRate: behavior.sessions > 0 ? Number((aggregates.orders / behavior.sessions).toFixed(4)) : 0,
      },
      topProducts: aggregates.topProducts.slice(0, 5),
      lowStockAlerts,
      recentOrders: orders
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map((order) => ({
          orderId: order.id,
          orderNo: order.orderNo,
          status: order.status,
          totalCents: order.totalCents,
          customerCountry: order.customerCountry ?? null,
          createdAt: order.createdAt.toISOString(),
        })),
    };
  }

  async getSalesAnalytics(days: number): Promise<SalesAnalyticsResponse> {
    const orders = await this.loadOrders(days);
    const aggregates = aggregateOrders(orders);

    return {
      rangeDays: days,
      ga4: this.mockProvider.getConnectionStatus(),
      summary: {
        gmvCents: aggregates.gmvCents,
        orders: aggregates.orders,
        aovCents: aggregates.aovCents,
      },
      trends: aggregates.trends,
      salesByCountry: aggregates.salesByCountry,
    };
  }

  async getProductAnalytics(days: number): Promise<ProductAnalyticsResponse> {
    const orders = await this.loadOrders(days);
    const aggregates = aggregateOrders(orders);
    const behavior = this.mockProvider.getBehaviorMetrics(days);
    const products = aggregates.topProducts.map((product, index) => ({
      ...product,
      views: Math.max(product.unitsSold * 6, behavior.productViews - index * 9),
      addToCart: Math.max(product.purchases * 3, behavior.addToCart - index * 3),
    }));

    return {
      rangeDays: days,
      ga4: this.mockProvider.getConnectionStatus(),
      summary: {
        productViews: behavior.productViews,
        addToCart: behavior.addToCart,
        purchases: aggregates.orders,
      },
      revenueByProduct: products,
    };
  }

  async getFunnelAnalytics(days: number): Promise<FunnelAnalyticsResponse> {
    const orders = await this.loadOrders(days);
    const aggregates = aggregateOrders(orders);
    const behavior = this.mockProvider.getBehaviorMetrics(days);
    const values = [
      { key: "sessions", label: "Sessions", value: behavior.sessions },
      { key: "product_views", label: "Product views", value: behavior.productViews },
      { key: "add_to_cart", label: "Add to cart", value: behavior.addToCart },
      { key: "begin_checkout", label: "Begin checkout", value: behavior.beginCheckout },
      { key: "purchase", label: "Purchase", value: aggregates.orders },
    ] satisfies Array<Pick<FunnelStep, "key" | "label" | "value">>;

    return {
      rangeDays: days,
      ga4: this.mockProvider.getConnectionStatus(),
      steps: values.map((step, index) => {
        const previous = values[index - 1]?.value ?? step.value;
        const dropOffRate = previous > 0 ? Number((1 - step.value / previous).toFixed(4)) : 0;
        return { ...step, dropOffRate: index === 0 ? 0 : Math.max(0, dropOffRate) };
      }),
    };
  }

  private async loadOrders(days: number) {
    const from = startDateForDays(days);
    return this.prisma.order.findMany({
      where: {
        status: { in: paidStatuses },
        createdAt: { gte: from },
      },
      include: analyticsOrderInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  private async loadLowStockAlerts() {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        active: true,
      },
      include: lowStockVariantInclude,
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
    });
    return variants
      .filter((variant) => variant.stock <= variant.lowStockThreshold)
      .slice(0, 5)
      .map((variant: LowStockVariantRecord) => ({
        variantId: variant.id,
        sku: variant.sku,
        stock: variant.stock,
        lowStockThreshold: variant.lowStockThreshold,
        product: variant.product,
      }));
  }
}

function startDateForDays(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - Math.max(days - 1, 0));
  return date;
}

function aggregateOrders(orders: AnalyticsOrderRecord[]) {
  const gmvCents = orders.reduce((sum, order) => sum + order.totalCents, 0);
  const orderCount = orders.length;
  const aovCents = orderCount > 0 ? Math.round(gmvCents / orderCount) : 0;

  const countryMap = new Map<string, { country: string; revenueCents: number; orders: number }>();
  const trendMap = new Map<string, { date: string; revenueCents: number; orders: number }>();
  const productMap = new Map<string, DashboardTopProduct>();

  for (const order of orders) {
    const country = order.customerCountry ?? "Unknown";
    countryMap.set(country, {
      country,
      revenueCents: (countryMap.get(country)?.revenueCents ?? 0) + order.totalCents,
      orders: (countryMap.get(country)?.orders ?? 0) + 1,
    });

    const date = order.createdAt.toISOString().slice(0, 10);
    trendMap.set(date, {
      date,
      revenueCents: (trendMap.get(date)?.revenueCents ?? 0) + order.totalCents,
      orders: (trendMap.get(date)?.orders ?? 0) + 1,
    });

    const uniqueProductsInOrder = new Set<string>();
    for (const item of order.items) {
      const current = productMap.get(item.productId) ?? {
        productId: item.productId,
        productTitle: item.titleSnapshot,
        revenueCents: 0,
        unitsSold: 0,
        purchases: 0,
      };
      current.revenueCents += item.lineTotalCents;
      current.unitsSold += item.quantity;
      if (!uniqueProductsInOrder.has(item.productId)) {
        current.purchases += 1;
        uniqueProductsInOrder.add(item.productId);
      }
      productMap.set(item.productId, current);
    }
  }

  return {
    gmvCents,
    orders: orderCount,
    aovCents,
    salesByCountry: [...countryMap.values()].sort((a, b) => b.revenueCents - a.revenueCents),
    trends: [...trendMap.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((point) => ({
        ...point,
        aovCents: point.orders > 0 ? Math.round(point.revenueCents / point.orders) : 0,
      })),
    topProducts: [...productMap.values()].sort((a, b) => (
      b.revenueCents - a.revenueCents || b.unitsSold - a.unitsSold
    )),
  };
}
