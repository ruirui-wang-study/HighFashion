export type AnalyticsConnectionStatus = {
  connected: boolean;
  status: "Connected" | "Not Connected";
};

export type AnalyticsTrendPoint = {
  date: string;
  revenueCents: number;
  orders: number;
  aovCents: number;
};

export type DashboardSummary = {
  gmvCents: number;
  orders: number;
  aovCents: number;
  conversionRate: number;
};

export type DashboardTopProduct = {
  productId: string;
  productTitle: string;
  revenueCents: number;
  unitsSold: number;
  purchases: number;
};

export type DashboardLowStockAlert = {
  variantId: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  product: {
    id: string;
    title: string;
    slug: string;
  };
};

export type DashboardRecentOrder = {
  orderId: string;
  orderNo: string;
  status: string;
  totalCents: number;
  customerCountry: string | null;
  createdAt: string;
};

export type DashboardAnalyticsResponse = {
  rangeDays: number;
  ga4: AnalyticsConnectionStatus;
  summary: DashboardSummary;
  topProducts: DashboardTopProduct[];
  lowStockAlerts: DashboardLowStockAlert[];
  recentOrders: DashboardRecentOrder[];
};

export type SalesByCountry = {
  country: string;
  revenueCents: number;
  orders: number;
};

export type SalesAnalyticsResponse = {
  rangeDays: number;
  ga4: AnalyticsConnectionStatus;
  summary: Pick<DashboardSummary, "gmvCents" | "orders" | "aovCents">;
  trends: AnalyticsTrendPoint[];
  salesByCountry: SalesByCountry[];
};

export type ProductRevenueRow = {
  productId: string;
  productTitle: string;
  revenueCents: number;
  purchases: number;
  unitsSold: number;
  views: number;
  addToCart: number;
};

export type ProductAnalyticsResponse = {
  rangeDays: number;
  ga4: AnalyticsConnectionStatus;
  summary: {
    productViews: number;
    addToCart: number;
    purchases: number;
  };
  revenueByProduct: ProductRevenueRow[];
};

export type FunnelStep = {
  key: "sessions" | "product_views" | "add_to_cart" | "begin_checkout" | "purchase";
  label: string;
  value: number;
  dropOffRate: number;
};

export type FunnelAnalyticsResponse = {
  rangeDays: number;
  ga4: AnalyticsConnectionStatus;
  steps: FunnelStep[];
};
