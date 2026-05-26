import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { opportunityDrafts } from "./seo-automation.drafts";
import { SeoAiRuntimeService } from "./seo-ai-runtime.service";
import { asRecord, asString, normalizeExpectedImpact } from "./seo-automation.shared";
import type { ContentOpportunityItem } from "./seo-automation.types";

@Injectable()
export class SeoOpportunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seoAiRuntime: SeoAiRuntimeService,
  ) {}

  async generateOpportunities(): Promise<ContentOpportunityItem[]> {
    await this.seedOpportunityDrafts();
    await this.enhanceOpportunityDraftsWithAi();
    return this.listOpportunities();
  }

  async listOpportunities(): Promise<ContentOpportunityItem[]> {
    let rows = await (this.prisma as unknown as {
      contentOpportunity: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).contentOpportunity.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) {
      await this.seedOpportunityDrafts();
      rows = await (this.prisma as unknown as {
        contentOpportunity: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
      }).contentOpportunity.findMany({
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      });
    }

    return rows.map((row) => ({
      id: String(row.id),
      opportunityType: String(row.opportunityType),
      keyword: row.keyword ? String(row.keyword) : null,
      currentPage: row.currentPage ? String(row.currentPage) : null,
      suggestedAction: String(row.suggestedAction),
      priority: String(row.priority),
      expectedImpact: String(row.expectedImpact),
      status: String(row.status) as ContentOpportunityItem["status"],
    }));
  }

  private async seedOpportunityDrafts() {
    for (const draft of opportunityDrafts) {
      await (this.prisma as unknown as {
        contentOpportunity: { upsert: (args: unknown) => Promise<unknown> };
      }).contentOpportunity.upsert({
        where: { id: draft.id },
        update: {
          opportunityType: draft.opportunityType,
          keyword: draft.keyword,
          currentPage: draft.currentPage,
          suggestedAction: draft.suggestedAction,
          priority: draft.priority,
          expectedImpact: draft.expectedImpact,
        },
        create: {
          id: draft.id,
          opportunityType: draft.opportunityType,
          keyword: draft.keyword,
          currentPage: draft.currentPage,
          suggestedAction: draft.suggestedAction,
          priority: draft.priority,
          expectedImpact: draft.expectedImpact,
          status: "NEW",
        },
      });
    }
  }

  private async enhanceOpportunityDraftsWithAi() {
    const items = await this.seoAiRuntime.rewriteOpportunityDrafts(
      opportunityDrafts.map((draft) => ({
        id: draft.id,
        opportunityType: draft.opportunityType,
        keyword: draft.keyword,
        currentPage: draft.currentPage,
        currentSuggestedAction: draft.suggestedAction,
        currentExpectedImpact: draft.expectedImpact,
        priority: draft.priority,
      })),
    );

    for (const item of items) {
      const record = asRecord(item);
      const id = asString(record.id);
      const suggestedAction = asString(record.suggestedAction);
      const expectedImpact = normalizeExpectedImpact(record.expectedImpact);
      if (!id || (!suggestedAction && !expectedImpact)) continue;

      await (this.prisma as unknown as {
        contentOpportunity: { update: (args: unknown) => Promise<unknown> };
      }).contentOpportunity.update({
        where: { id },
        data: {
          ...(suggestedAction ? { suggestedAction } : {}),
          ...(expectedImpact ? { expectedImpact } : {}),
        },
      });
    }
  }
}
