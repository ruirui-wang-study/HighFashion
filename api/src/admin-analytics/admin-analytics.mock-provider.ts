import type { AnalyticsConnectionStatus } from "./admin-analytics.types";

export type MockBehaviorMetrics = {
  sessions: number;
  productViews: number;
  addToCart: number;
  beginCheckout: number;
};

export class AdminAnalyticsMockProvider {
  getConnectionStatus(): AnalyticsConnectionStatus {
    return { connected: false, status: "Not Connected" };
  }

  getBehaviorMetrics(days: number): MockBehaviorMetrics {
    const normalized = Math.max(days, 1);
    return {
      sessions: normalized * 120,
      productViews: normalized * 86,
      addToCart: normalized * 28,
      beginCheckout: normalized * 16,
    };
  }
}
