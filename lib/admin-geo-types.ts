export type GeoPlatform = "CHATGPT" | "PERPLEXITY" | "GEMINI" | "GOOGLE_AI_OVERVIEW";

export type GeoPrompt = {
  id: string;
  prompt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GeoTestRun = {
  id: string;
  platform: GeoPlatform;
  promptId?: string | null;
  promptText: string;
  notes?: string | null;
  whetherPulseGearMentioned: boolean;
  whetherPulseGearCited: boolean;
  createdAt: string;
  citations: Array<{ id: string; url: string }>;
  mentions: Array<{ id: string; brand: string; isPulse: boolean }>;
  competitors: Array<{ id: string; brand: string }>;
};

export type GeoRecommendation = {
  id: string;
  query?: string | null;
  pagePath?: string | null;
  recommendation: string;
  recommendationType: string;
  priority: string;
  status: "DRAFT" | "REVIEWED" | "APPLIED";
  createdAt: string;
  updatedAt: string;
};

export type GeoDashboardSummary = {
  totalPrompts: number;
  totalRuns: number;
  pulseMentionedRuns: number;
  pulseCitedRuns: number;
  recommendations: GeoRecommendation[];
};
