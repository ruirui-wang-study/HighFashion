export type SearchConsoleMetricSeed = {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  clicksDelta: number;
  impressionsDelta: number;
};

export type SearchConsoleQuerySeed = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  landingPage: string;
  country: string;
  device: string;
};

export interface SearchConsoleProvider {
  isConfigured(): boolean;
  getPageMetrics(days: number): SearchConsoleMetricSeed[];
  getQueryMetrics(days: number): SearchConsoleQuerySeed[];
}
