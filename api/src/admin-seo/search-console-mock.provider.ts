import type { SearchConsoleProvider } from "./search-console-provider.interface";

export class SearchConsoleMockProvider implements SearchConsoleProvider {
  isConfigured() {
    return false;
  }

  getPageMetrics(days: number) {
    const multiplier = Math.max(days / 7, 1);
    return [
      { url: "/products/pulseflex-knee-sleeve", clicks: Math.round(184 * multiplier), impressions: Math.round(2300 * multiplier), ctr: 0.08, position: 9.4, clicksDelta: -22, impressionsDelta: -180 },
      { url: "/guides/choose-knee-support-running", clicks: Math.round(132 * multiplier), impressions: Math.round(1860 * multiplier), ctr: 0.071, position: 11.2, clicksDelta: -15, impressionsDelta: -120 },
      { url: "/collections/support", clicks: Math.round(118 * multiplier), impressions: Math.round(1640 * multiplier), ctr: 0.072, position: 10.1, clicksDelta: -11, impressionsDelta: -92 },
      { url: "/products/corecarry-running-belt", clicks: Math.round(96 * multiplier), impressions: Math.round(1420 * multiplier), ctr: 0.067, position: 12.5, clicksDelta: -18, impressionsDelta: -140 },
    ];
  }

  getQueryMetrics(days: number) {
    const multiplier = Math.max(days / 7, 1);
    return [
      { query: "best knee sleeve for running", clicks: Math.round(78 * multiplier), impressions: Math.round(940 * multiplier), ctr: 0.083, position: 8.7, landingPage: "/products/pulseflex-knee-sleeve", country: "US", device: "mobile" },
      { query: "running knee support", clicks: Math.round(64 * multiplier), impressions: Math.round(880 * multiplier), ctr: 0.073, position: 10.4, landingPage: "/guides/choose-knee-support-running", country: "US", device: "desktop" },
      { query: "no bounce running belt", clicks: Math.round(51 * multiplier), impressions: Math.round(760 * multiplier), ctr: 0.067, position: 12.2, landingPage: "/products/corecarry-running-belt", country: "CA", device: "mobile" },
      { query: "pickleball knee support", clicks: Math.round(39 * multiplier), impressions: Math.round(690 * multiplier), ctr: 0.057, position: 13.8, landingPage: "/guides/pickleball-knee-support-guide", country: "GB", device: "mobile" },
    ];
  }
}
