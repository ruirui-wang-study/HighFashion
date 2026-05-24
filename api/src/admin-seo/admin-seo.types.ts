export type SearchConsoleConnectionStatus = {
  connected: boolean;
  status: "Connected" | "Not Connected";
};

export type SeoOverviewResponse = {
  rangeDays: number;
  searchConsole: SearchConsoleConnectionStatus;
  summary: {
    organicClicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  };
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    url: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    healthScore: number;
  }>;
  pagesLosingTraffic: Array<{
    url: string;
    clicksDelta: number;
    impressionsDelta: number;
    healthScore: number;
  }>;
  healthSummary: {
    averageHealthScore: number;
    pagesBelow80: number;
  };
};

export type SeoPageRow = {
  url: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  indexStatus: "indexable" | "noindex";
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  healthScore: number;
  issues: string[];
};

export type SeoPagesResponse = {
  rangeDays: number;
  searchConsole: SearchConsoleConnectionStatus;
  rows: SeoPageRow[];
};

export type SeoQueryRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  landingPage: string;
  country: string;
  device: string;
};

export type SeoQueriesResponse = {
  rangeDays: number;
  searchConsole: SearchConsoleConnectionStatus;
  rows: SeoQueryRow[];
};
