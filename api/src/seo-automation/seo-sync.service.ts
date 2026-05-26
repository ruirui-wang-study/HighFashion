import { Injectable } from "@nestjs/common";
import type { Ga4SyncResult, SearchConsoleSyncResult, SeoAutomationConnection } from "./seo-automation.types";
import { PrismaService } from "../common/prisma.service";

const gscMockRows = [
  {
    page: "/products/pulseflex-knee-sleeve",
    query: "best knee sleeve for running",
    country: "US",
    device: "mobile",
    clicks: 82,
    impressions: 2040,
    ctr: 0.0402,
    position: 9.4,
    date: "2026-05-21",
  },
  {
    page: "/guides/choose-knee-support-running",
    query: "running knee support",
    country: "US",
    device: "desktop",
    clicks: 67,
    impressions: 1805,
    ctr: 0.0371,
    position: 11.2,
    date: "2026-05-21",
  },
  {
    page: "/products/corecarry-running-belt",
    query: "no bounce running belt",
    country: "CA",
    device: "mobile",
    clicks: 24,
    impressions: 890,
    ctr: 0.027,
    position: 14.6,
    date: "2026-05-21",
  },
];

const ga4MockRows = [
  {
    landingPage: "/products/pulseflex-knee-sleeve",
    sourceMedium: "google / organic",
    sessions: 138,
    totalUsers: 120,
    pageViews: 201,
    viewItem: 112,
    addToCart: 9,
    beginCheckout: 3,
    purchase: 0,
    revenue: 0,
    date: "2026-05-21",
  },
  {
    landingPage: "/guides/choose-knee-support-running",
    sourceMedium: "google / organic",
    sessions: 91,
    totalUsers: 82,
    pageViews: 134,
    viewItem: 0,
    addToCart: 0,
    beginCheckout: 0,
    purchase: 0,
    revenue: 0,
    date: "2026-05-21",
  },
];

@Injectable()
export class SeoSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async syncSearchConsole(): Promise<SearchConsoleSyncResult> {
    const connection = this.getSearchConsoleConnection();
    const rows = gscMockRows;

    for (const row of rows) {
      await (this.prisma as unknown as {
        searchConsoleQueryDaily: { upsert: (args: unknown) => Promise<unknown> };
        searchConsolePageDaily: { upsert: (args: unknown) => Promise<unknown> };
      }).searchConsoleQueryDaily.upsert({
        where: {
          siteUrl_date_query_page_country_device: {
            siteUrl: "sc-domain:pulsegear.local",
            date: new Date(row.date),
            query: row.query,
            page: row.page,
            country: row.country,
            device: row.device,
          },
        },
        update: {
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
        create: {
          siteUrl: "sc-domain:pulsegear.local",
          date: new Date(row.date),
          query: row.query,
          page: row.page,
          country: row.country,
          device: row.device,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
      });
      await (this.prisma as unknown as {
        searchConsolePageDaily: { upsert: (args: unknown) => Promise<unknown> };
      }).searchConsolePageDaily.upsert({
        where: {
          siteUrl_date_page_country_device: {
            siteUrl: "sc-domain:pulsegear.local",
            date: new Date(row.date),
            page: row.page,
            country: row.country,
            device: row.device,
          },
        },
        update: {
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
        create: {
          siteUrl: "sc-domain:pulsegear.local",
          date: new Date(row.date),
          page: row.page,
          country: row.country,
          device: row.device,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
      });
    }

    return {
      connection,
      rows,
      syncedAt: connection.connected ? new Date().toISOString() : null,
    };
  }

  async syncGa4(): Promise<Ga4SyncResult> {
    const connection = this.getGa4Connection();
    const rows = ga4MockRows;
    for (const row of rows) {
      await (this.prisma as unknown as {
        ga4LandingPageDaily: { upsert: (args: unknown) => Promise<unknown> };
      }).ga4LandingPageDaily.upsert({
        where: {
          landingPage_sourceMedium_date: {
            landingPage: row.landingPage,
            sourceMedium: row.sourceMedium,
            date: new Date(row.date),
          },
        },
        update: {
          sessions: row.sessions,
          totalUsers: row.totalUsers,
          pageViews: row.pageViews,
          viewItem: row.viewItem,
          addToCart: row.addToCart,
          beginCheckout: row.beginCheckout,
          purchase: row.purchase,
          revenue: row.revenue,
        },
        create: {
          landingPage: row.landingPage,
          sourceMedium: row.sourceMedium,
          date: new Date(row.date),
          sessions: row.sessions,
          totalUsers: row.totalUsers,
          pageViews: row.pageViews,
          viewItem: row.viewItem,
          addToCart: row.addToCart,
          beginCheckout: row.beginCheckout,
          purchase: row.purchase,
          revenue: row.revenue,
        },
      });
    }
    return {
      connection,
      rows,
      syncedAt: connection.connected ? new Date().toISOString() : null,
    };
  }

  getSearchConsoleConnection(): SeoAutomationConnection {
    return {
      connected: Boolean(process.env.GSC_SITE_URL && process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY),
      status: (process.env.GSC_SITE_URL && process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY ? "Connected" : "Not Connected") as
        | "Connected"
        | "Not Connected",
    };
  }

  getGa4Connection(): SeoAutomationConnection {
    return {
      connected: Boolean(process.env.GA4_PROPERTY_ID && process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY),
      status: (process.env.GA4_PROPERTY_ID && process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY ? "Connected" : "Not Connected") as
        | "Connected"
        | "Not Connected",
    };
  }
}
