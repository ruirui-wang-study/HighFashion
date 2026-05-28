export type AnalyticsRangeDays = 7 | 30 | 90;

export type AdminAnalyticsConnection = {
  connected: boolean;
  status: "Connected" | "Not Connected";
};

export type AdminDashboardAnalytics = {
  rangeDays: number;
  ga4: AdminAnalyticsConnection;
  summary: {
    gmvCents: number;
    orders: number;
    aovCents: number;
    conversionRate: number;
  };
  opsHealth: {
    pendingOver30m: number;
    shortOrders: number;
    webhookSuccessRate24h: number;
  };
  topProducts: Array<{
    productId: string;
    productTitle: string;
    revenueCents: number;
    unitsSold: number;
    purchases: number;
  }>;
  lowStockAlerts: Array<{
    variantId: string;
    sku: string;
    stock: number;
    lowStockThreshold: number;
    product: { id: string; title: string; slug: string };
  }>;
  recentOrders: Array<{
    orderId: string;
    orderNo: string;
    status: string;
    totalCents: number;
    customerCountry: string | null;
    createdAt: string;
  }>;
};

export type AdminSalesAnalytics = {
  rangeDays: number;
  ga4: AdminAnalyticsConnection;
  summary: {
    gmvCents: number;
    orders: number;
    aovCents: number;
  };
  trends: Array<{
    date: string;
    revenueCents: number;
    orders: number;
    aovCents: number;
  }>;
  salesByCountry: Array<{
    country: string;
    revenueCents: number;
    orders: number;
  }>;
};

export type AdminProductAnalytics = {
  rangeDays: number;
  ga4: AdminAnalyticsConnection;
  summary: {
    productViews: number;
    addToCart: number;
    purchases: number;
  };
  revenueByProduct: Array<{
    productId: string;
    productTitle: string;
    revenueCents: number;
    purchases: number;
    unitsSold: number;
    views: number;
    addToCart: number;
  }>;
};

export type AdminFunnelAnalytics = {
  rangeDays: number;
  ga4: AdminAnalyticsConnection;
  steps: Array<{
    key: "sessions" | "product_views" | "add_to_cart" | "begin_checkout" | "purchase";
    label: string;
    value: number;
    dropOffRate: number;
  }>;
};
