export type SearchConsoleRangeDays = 7 | 30 | 90;

export type SearchConsoleConnection = {
  connected: boolean;
  status: "Connected" | "Not Connected";
};

export type AdminSeoOverview = {
  rangeDays: number;
  searchConsole: SearchConsoleConnection;
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

export type AdminSeoPageRow = {
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

export type AdminSeoPages = {
  rangeDays: number;
  searchConsole: SearchConsoleConnection;
  rows: AdminSeoPageRow[];
};

export type AdminSeoQueryRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  landingPage: string;
  country: string;
  device: string;
};

export type AdminSeoQueries = {
  rangeDays: number;
  searchConsole: SearchConsoleConnection;
  rows: AdminSeoQueryRow[];
};
