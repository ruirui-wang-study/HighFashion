import { BadRequestException, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { CreateGeoPromptDto } from "./dto/create-geo-prompt.dto";
import { CreateGeoRecommendationDto } from "./dto/create-geo-recommendation.dto";
import { CreateGeoTestRunDto } from "./dto/create-geo-test-run.dto";

type AdminActor = { adminId: string; adminEmail: string };

const DEFAULT_PROMPTS = [
  "best running belt for phone and keys",
  "patella strap vs knee sleeve for running",
  "what to carry on a summer run",
  "pickleball knee support for beginners",
];

const GEO_GUIDE_DRAFT_TITLES = [
  "Patella Strap vs Knee Sleeve: Which One Should Runners Choose?",
  "Running Belt vs Hydration Belt: What Should You Use?",
  "What to Carry on a Summer Run",
  "Pickleball Knee Support Guide for Beginners",
  "Best Running Essentials for Hot Weather",
  "Compression Socks vs Training Socks",
  "Court Sport Essentials for Beginners",
  "How to Build a Summer Training Kit",
];

@Injectable()
export class AdminGeoService {
  constructor(private readonly prisma: PrismaService) {}

  async listPrompts() {
    await this.seedDefaultPrompts();
    return this.prisma.geoPrompt.findMany({ orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }] });
  }

  async createPrompt(actor: AdminActor, input: CreateGeoPromptDto) {
    const prompt = await this.prisma.geoPrompt.create({
      data: { prompt: input.prompt.trim(), isActive: input.isActive ?? true, createdById: actor.adminId },
    });
    await this.writeAudit(actor.adminId, "GEO_PROMPT_CREATED", prompt.id, { prompt: prompt.prompt });
    return prompt;
  }

  async listResults() {
    return this.prisma.geoTestRun.findMany({
      orderBy: { createdAt: "desc" },
      include: { citations: true, mentions: true, competitors: true, prompt: true },
      take: 200,
    });
  }

  async createResult(actor: AdminActor, input: CreateGeoTestRunDto) {
    if (input.promptId) {
      const prompt = await this.prisma.geoPrompt.findUnique({ where: { id: input.promptId } });
      if (!prompt) throw new BadRequestException("Geo prompt not found");
    }
    const result = await this.prisma.$transaction(async (tx) => {
      return tx.geoTestRun.create({
        data: {
          platform: input.platform,
          promptId: input.promptId,
          promptText: input.prompt.trim(),
          notes: input.notes?.trim() || null,
          whetherPulseGearMentioned: input.whetherPulseGearMentioned,
          whetherPulseGearCited: input.whetherPulseGearCited,
          actorId: actor.adminId,
          citations: {
            create: (input.citedUrls ?? []).map((url) => ({ url })),
          },
          mentions: {
            create: (input.mentionedBrands ?? []).map((brand) => ({
              brand,
              isPulse: brand.trim().toLowerCase() === "pulsegear",
            })),
          },
          competitors: {
            create: (input.competitorBrands ?? []).map((brand) => ({ brand })),
          },
        },
        include: { citations: true, mentions: true, competitors: true, prompt: true },
      });
    });
    await this.writeAudit(actor.adminId, "GEO_TEST_RUN_CREATED", result.id, { platform: result.platform, prompt: result.promptText });
    return result;
  }

  async listCompetitors() {
    const rows = await this.prisma.geoCompetitor.groupBy({
      by: ["brand"],
      _count: { brand: true },
      orderBy: { _count: { brand: "desc" } },
      take: 100,
    });
    return rows.map((row) => ({ brand: row.brand, count: row._count.brand }));
  }

  async listRecommendations() {
    return this.prisma.geoRecommendation.findMany({ orderBy: [{ status: "asc" }, { updatedAt: "desc" }] });
  }

  async createRecommendation(actor: AdminActor, input: CreateGeoRecommendationDto) {
    const record = await this.prisma.geoRecommendation.create({
      data: {
        query: input.query?.trim() || null,
        pagePath: input.pagePath?.trim() || null,
        recommendation: input.recommendation.trim(),
        recommendationType: input.recommendationType.trim(),
        priority: input.priority?.trim() || "MEDIUM",
        status: input.status ?? "DRAFT",
        createdById: actor.adminId,
      },
    });
    await this.writeAudit(actor.adminId, "GEO_RECOMMENDATION_CREATED", record.id, { type: record.recommendationType });
    return record;
  }

  async getDashboardSummary() {
    await this.seedGeoGuideDrafts();
    const [totalPrompts, totalRuns, pulseMentionedRuns, pulseCitedRuns, recommendations] = await Promise.all([
      this.prisma.geoPrompt.count({ where: { isActive: true } }),
      this.prisma.geoTestRun.count(),
      this.prisma.geoTestRun.count({ where: { whetherPulseGearMentioned: true } }),
      this.prisma.geoTestRun.count({ where: { whetherPulseGearCited: true } }),
      this.prisma.geoRecommendation.findMany({ where: { status: "DRAFT" }, orderBy: { createdAt: "desc" }, take: 20 }),
    ]);
    return { totalPrompts, totalRuns, pulseMentionedRuns, pulseCitedRuns, recommendations };
  }

  private async seedDefaultPrompts() {
    const count = await this.prisma.geoPrompt.count();
    if (count > 0) return;
    await this.prisma.geoPrompt.createMany({
      data: DEFAULT_PROMPTS.map((prompt) => ({ prompt, isActive: true })),
      skipDuplicates: true,
    });
  }

  private async seedGeoGuideDrafts() {
    for (const title of GEO_GUIDE_DRAFT_TITLES) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const existing = await this.prisma.geoContentDraft.findUnique({ where: { slug } });
      if (existing) continue;
      await this.prisma.geoContentDraft.create({
        data: {
          title,
          slug,
          contentType: "GUIDE",
          status: "DRAFT",
          source: "GEO_TEMPLATE",
          payload: {
            directAnswer: "",
            summary: "",
            comparisonTable: [],
            bestFor: [],
            howToChoose: [],
            commonMistakes: [],
            recommendedProducts: [],
            faq: [],
            relatedGuides: [],
            relatedCollections: [],
          } as Prisma.InputJsonValue,
        },
      });
      const contentEntry = await this.prisma.contentEntry.findFirst({
        where: { type: "GUIDE", slug },
      });
      if (!contentEntry) {
        await this.prisma.contentEntry.create({
          data: {
            type: "GUIDE",
            title,
            titleEn: title,
            slug,
            status: "DRAFT",
            seoTitle: title,
            seoTitleEn: title,
            seoDescription: `GEO draft guide for ${title}`,
            seoDescriptionEn: `GEO draft guide for ${title}`,
            guideContent: {
              create: {
                dek: "Draft generated for GEO template. Requires human review before publish.",
                dekEn: "Draft generated for GEO template. Requires human review before publish.",
                category: "GEO Guide",
                categoryEn: "GEO Guide",
                authorName: "PulseGear Editorial Team",
                authorRole: "Content Operations",
                authorRoleEn: "Content Operations",
                readTime: "6 min",
                readTimeEn: "6 min",
                sections: [
                  { heading: "Direct Answer", body: "" },
                  { heading: "Summary", body: "" },
                  { heading: "Comparison Table", body: "" },
                  { heading: "Best For", body: "" },
                  { heading: "How to Choose", body: "" },
                  { heading: "Common Mistakes", body: "" },
                  { heading: "Recommended Products", body: "" },
                ] as Prisma.InputJsonValue,
                sectionsEn: [
                  { heading: "Direct Answer", body: "" },
                  { heading: "Summary", body: "" },
                  { heading: "Comparison Table", body: "" },
                  { heading: "Best For", body: "" },
                  { heading: "How to Choose", body: "" },
                  { heading: "Common Mistakes", body: "" },
                  { heading: "Recommended Products", body: "" },
                ] as Prisma.InputJsonValue,
                faq: [] as Prisma.InputJsonValue,
                faqEn: [] as Prisma.InputJsonValue,
                relatedProducts: [] as Prisma.InputJsonValue,
                relatedCollections: [] as Prisma.InputJsonValue,
                relatedGuides: [] as Prisma.InputJsonValue,
              },
            },
          },
        });
      }
    }
  }

  private async writeAudit(actorId: string, action: string, resourceId: string, details: Record<string, unknown>) {
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        resource: "GEO",
        resourceId,
        details: details as Prisma.InputJsonValue,
      },
    });
  }
}
