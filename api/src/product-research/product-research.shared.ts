import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { defaultScoringWeights } from "./product-research.engine";
import type { CandidateImportDraft } from "./product-research.provider";

export type AdminActor = {
  adminId: string;
  adminEmail: string;
};

export const candidateDetailInclude = {
  scores: {
    orderBy: { createdAt: "desc" },
    take: 5,
  },
  suppliers: {
    include: {
      supplier: true,
    },
  },
  signals: {
    orderBy: [{ collectedAt: "desc" }],
    take: 8,
  },
  riskFlags: {
    orderBy: { createdAt: "desc" },
  },
  testLaunches: {
    orderBy: { createdAt: "desc" },
  },
  decisions: {
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.ProductCandidateInclude;

export function resolveCandidateSort(sort?: string): Prisma.ProductCandidateOrderByWithRelationInput[] {
  switch (sort) {
    case "score-desc":
      return [{ finalScore: "desc" }, { updatedAt: "desc" }];
    case "score-asc":
      return [{ finalScore: "asc" }, { updatedAt: "desc" }];
    case "created-asc":
      return [{ createdAt: "asc" }];
    case "created-desc":
      return [{ createdAt: "desc" }];
    case "updated-asc":
      return [{ updatedAt: "asc" }, { createdAt: "asc" }];
    default:
      return [{ updatedAt: "desc" }, { createdAt: "desc" }];
  }
}

export function requiredString(value: unknown, field: string) {
  const normalized = optionalString(value);
  if (!normalized) {
    throw new BadRequestException({ code: "PRODUCT_RESEARCH_VALIDATION_ERROR", message: `${field} is required` });
  }
  return normalized;
}

export function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function enumString<T extends string>(value: unknown, allowed: readonly T[], fallback?: T) {
  if (typeof value === "string" && allowed.includes(value as T)) {
    return value as T;
  }
  if (fallback) return fallback;
  throw new BadRequestException({ code: "PRODUCT_RESEARCH_VALIDATION_ERROR", message: `Invalid enum value: ${String(value)}` });
}

export function jsonValue(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

export function mapCandidateStatusFromDecision(decision: string, actor?: AdminActor): Prisma.ProductCandidateUpdateInput {
  switch (decision) {
    case "SAMPLE":
      return { status: "SAMPLE", recommendedAction: "SAMPLE" };
    case "TEST":
      return { status: "TEST", recommendedAction: "TEST" };
    case "WATCH":
      return { status: "WATCH", recommendedAction: "WATCH" };
    case "APPROVE":
      return {
        status: "APPROVED",
        recommendedAction: "APPROVE",
        approvedAt: new Date(),
        approvedBy: actor?.adminId ? { connect: { id: actor.adminId } } : undefined,
      };
    case "REJECT":
      return { status: "REJECTED", recommendedAction: "REJECT" };
    default:
      return {};
  }
}

export async function ensureCandidateExists(prisma: PrismaService, candidateId: string) {
  const candidate = await prisma.productCandidate.findUnique({
    where: { id: candidateId },
    select: { id: true },
  });
  if (!candidate) {
    throw new NotFoundException({ code: "PRODUCT_RESEARCH_CANDIDATE_NOT_FOUND", message: "Candidate not found" });
  }
}

export function ratio(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Number((numerator / denominator).toFixed(4));
}

export function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()) : [];
}

export function defaultBenefits(candidate: { targetMarket: string; useCase: string | null }) {
  return [
    `Draft positioning for ${candidate.targetMarket}`,
    candidate.useCase ? `Built for ${candidate.useCase}` : "Use case pending merchandising review",
    "Benefits pending AI research refinement",
  ];
}

export function defaultFeatures(candidate: { category: string }) {
  return [
    `${candidate.category} draft feature set`,
    "Supplier and testing data pending review",
    "Final merchandising copy required before publish",
  ];
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80) || "research-draft";
}

export async function buildAvailableProductSlug(tx: Prisma.TransactionClient, source: string) {
  const base = slugify(source);
  let slug = base;
  let suffix = 2;

  while (await tx.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function round2(value: number | null | undefined) {
  if (value == null) return null;
  return Number(value.toFixed(2));
}

export function parseWeights(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const weights = value as Record<string, unknown>;
  const parsed = Object.fromEntries(
    Object.entries(defaultScoringWeights).map(([key, fallback]) => {
      const next = weights[key];
      return [key, typeof next === "number" ? next : fallback];
    }),
  ) as Partial<typeof defaultScoringWeights>;
  return parsed;
}

export function normalizePreviewItem(item: Record<string, unknown>): CandidateImportDraft {
  const productName = requiredString(item.productName, "productName");
  const category = requiredString(item.category, "category");
  const targetMarket = requiredString(item.targetMarket, "targetMarket");
  return {
    productName,
    chineseName: optionalString(item.chineseName),
    slugSuggestion: optionalString(item.slugSuggestion),
    category,
    targetMarket,
    targetAudience: optionalString(item.targetAudience),
    useCase: optionalString(item.useCase),
    description: optionalString(item.description),
    notes: optionalString(item.notes),
    brandAngle: optionalString(item.brandAngle),
    positioningSummary: optionalString(item.positioningSummary),
    alibabaKeywords: optionalString(item.alibabaKeywords),
    sourceUrl: optionalString(item.sourceUrl),
    source: enumString(item.source, ["MANUAL", "AI_GENERATED", "CSV", "ALIBABA_LINK", "SUPPLIER_QUOTE"], "MANUAL"),
    rawImportData: jsonValue(item.rawImportData),
    aiDraftPayload: jsonValue(item.aiDraftPayload),
  };
}

export function normalizeCandidateCsvRow(row: Record<string, unknown>, index: number) {
  const productName = optionalString(row.product_name ?? row.productName);
  const category = optionalString(row.category);
  const targetMarket = optionalString(row.target_market ?? row.targetMarket);
  const errors: string[] = [];
  if (!productName) errors.push("product_name is required");
  if (!category) errors.push("category is required");
  if (!targetMarket) errors.push("target_market is required");
  const draft: CandidateImportDraft = {
    productName: productName ?? `Row ${index + 1}`,
    chineseName: optionalString(row.chinese_name ?? row.chineseName),
    slugSuggestion: productName ?? null,
    category: category ?? "uncategorized",
    targetMarket: targetMarket ?? "US",
    targetAudience: optionalString(row.target_audience ?? row.targetAudience),
    useCase: optionalString(row.use_case ?? row.useCase),
    description: optionalString(row.description),
    notes: optionalString(row.notes),
    alibabaKeywords: optionalString(row.alibaba_keywords ?? row.alibabaKeywords),
    source: "CSV",
    rawImportData: row as Prisma.InputJsonValue,
  };
  return {
    index,
    original: row,
    errors,
    draft,
  };
}

export function normalizeSupplierQuoteRow(row: Record<string, unknown>, index: number) {
  const productName = optionalString(row.product_name ?? row.productName);
  const supplierName = optionalString(row.supplier_name ?? row.supplierName);
  const platform = enumString(row.platform, ["ALIBABA", "ALIEXPRESS", "CJ_DROPSHIPPING", "AGENT", "OTHER"], "OTHER");
  const supplierUrl = optionalString(row.supplier_url ?? row.supplierUrl);
  const errors: string[] = [];
  if (!productName) errors.push("product_name is required");
  if (!supplierName) errors.push("supplier_name is required");
  const supplierData: Prisma.SupplierUncheckedCreateInput = {
    platform,
    name: supplierName ?? `Supplier ${index + 1}`,
    url: supplierUrl ?? null,
    country: optionalString(row.country),
    verifiedSupplier: toBoolean(row.verified_supplier ?? row.verifiedSupplier),
    tradeAssurance: toBoolean(row.trade_assurance ?? row.tradeAssurance),
    yearsOnPlatform: toNullableInt(row.years_on_platform ?? row.yearsOnPlatform),
    responseRate: toNullableFloat(row.response_rate ?? row.responseRate),
    moq: toNullableInt(row.moq),
    samplePriceCents: toMoneyCents(row.sample_price ?? row.samplePrice),
    unitPriceCents: toMoneyCents(row.unit_price ?? row.unitPrice),
    customLogoMoq: toNullableInt(row.custom_logo_moq ?? row.customLogoMoq),
    customPackagingMoq: toNullableInt(row.custom_packaging_moq ?? row.customPackagingMoq),
    leadTimeDays: toNullableInt(row.lead_time_days ?? row.leadTimeDays),
    shippingToUSCents: toMoneyCents(row.shipping_to_us ?? row.shippingToUS),
    shippingToUKCents: toMoneyCents(row.shipping_to_uk ?? row.shippingToUK),
    certifications: splitDelimitedStrings(row.certifications),
    notes: optionalString(row.notes),
  };
  const quoteData = {
    quotedUnitPriceCents: supplierData.unitPriceCents,
    quotedMoq: supplierData.moq,
    quotedLeadTimeDays: supplierData.leadTimeDays,
    notes: optionalString(row.notes),
  };
  return {
    index,
    original: row,
    errors,
    productName: productName ?? "",
    supplierUrl,
    preview: {
      productName,
      supplierName,
      platform,
      moq: supplierData.moq,
      unitPriceCents: supplierData.unitPriceCents,
      shippingToUSCents: supplierData.shippingToUSCents,
      leadTimeDays: supplierData.leadTimeDays,
      verifiedSupplier: supplierData.verifiedSupplier,
      tradeAssurance: supplierData.tradeAssurance,
    },
    supplierData,
    quoteData,
  };
}

export function splitDelimitedStrings(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value
        .split(/[|,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

export function normalizeLinkList(links?: string[]) {
  return Array.isArray(links)
    ? [...new Set(links.map((item) => item.trim()).filter((item) => item.startsWith("http")))]
    : [];
}

export function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "1", "yes", "y"].includes(value.toLowerCase());
  if (typeof value === "number") return value > 0;
  return false;
}

export function toNullableInt(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toNullableFloat(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

export function toMoneyCents(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

export function mergeTextFields(current: string | null, incoming: string | null | undefined) {
  if (!incoming) return current;
  if (!current) return incoming;
  if (current.includes(incoming)) return current;
  return `${current}\n${incoming}`.trim();
}

export function joinNotes(current: string | null | undefined, appended: string | null | undefined) {
  return mergeTextFields(current ?? null, appended ?? null);
}

export type CandidateDuplicateKeyInput = {
  productName: string;
  category: string;
  targetMarket: string;
};

export type CandidateDuplicateRecord = {
  id: string;
  productName: string;
  category: string;
  targetMarket: string;
  notes: string | null;
  sourceUrl: string | null;
  alibabaKeywords: string | null;
};

export const PRODUCT_RESEARCH_SCORE_HISTORY_LIMIT = 20;

export const PRODUCT_RESEARCH_LOCKED_STATUSES = new Set(["APPROVED", "REJECTED"]);

export function candidateDuplicateKey(input: CandidateDuplicateKeyInput) {
  return `${input.productName.trim().toLowerCase()}|${input.category.trim().toLowerCase()}|${input.targetMarket.trim().toLowerCase()}`;
}

export { paginatedResult, resolvePagination } from "../common/pagination";

export async function loadCandidateDuplicateMap(
  prisma: PrismaService,
  items: CandidateDuplicateKeyInput[],
): Promise<Map<string, CandidateDuplicateRecord>> {
  const uniqueItems = new Map<string, CandidateDuplicateKeyInput>();
  for (const item of items) {
    if (!item.productName?.trim() || !item.category?.trim() || !item.targetMarket?.trim()) {
      continue;
    }
    uniqueItems.set(candidateDuplicateKey(item), item);
  }

  if (uniqueItems.size === 0) {
    return new Map();
  }

  const candidates = await prisma.productCandidate.findMany({
    where: {
      OR: [...uniqueItems.values()].map((item) => ({
        productName: { equals: item.productName, mode: "insensitive" as const },
        category: { equals: item.category, mode: "insensitive" as const },
        targetMarket: { equals: item.targetMarket, mode: "insensitive" as const },
      })),
    },
    select: {
      id: true,
      productName: true,
      category: true,
      targetMarket: true,
      notes: true,
      sourceUrl: true,
      alibabaKeywords: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const map = new Map<string, CandidateDuplicateRecord>();
  for (const candidate of candidates) {
    const key = candidateDuplicateKey(candidate);
    if (!map.has(key)) {
      map.set(key, candidate);
    }
  }

  return map;
}

export async function loadSuppliersByUrlMap(prisma: PrismaService, urls: Array<string | null | undefined>) {
  const uniqueUrls = [...new Set(urls.map((url) => url?.trim().toLowerCase()).filter((url): url is string => Boolean(url)))];
  if (uniqueUrls.length === 0) {
    return new Map<string, { id: string; name: string; url: string | null }>();
  }

  const suppliers = await prisma.supplier.findMany({
    where: {
      OR: uniqueUrls.map((url) => ({
        url: { equals: url, mode: "insensitive" as const },
      })),
    },
    select: {
      id: true,
      name: true,
      url: true,
    },
  });

  const map = new Map<string, { id: string; name: string; url: string | null }>();
  for (const supplier of suppliers) {
    const key = supplier.url?.trim().toLowerCase();
    if (key && !map.has(key)) {
      map.set(key, supplier);
    }
  }

  return map;
}

export async function runWithConcurrency<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>) {
  const limit = Math.max(1, concurrency);
  for (let index = 0; index < items.length; index += limit) {
    const chunk = items.slice(index, index + limit);
    await Promise.all(chunk.map((item) => worker(item)));
  }
}
