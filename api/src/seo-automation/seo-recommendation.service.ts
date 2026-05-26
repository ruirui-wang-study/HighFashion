import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { recommendationDrafts } from "./seo-automation.drafts";
import { SeoContentPipelineService } from "./seo-content-pipeline.service";
import { SeoAiRuntimeService } from "./seo-ai-runtime.service";
import { asRecord, asString, mapRecommendation, type SeoAdminActor } from "./seo-automation.shared";
import type { SeoRecommendationItem } from "./seo-automation.types";

@Injectable()
export class SeoRecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seoAiRuntime: SeoAiRuntimeService,
    private readonly contentPipelineService: SeoContentPipelineService,
  ) {}

  async generateRecommendations(): Promise<SeoRecommendationItem[]> {
    const pulseflexProductId = await this.contentPipelineService.getProductIdBySlug("pulseflex-knee-sleeve");
    await this.seedRecommendationDrafts(pulseflexProductId);
    await this.enhanceRecommendationDraftsWithAi(pulseflexProductId);
    return this.listRecommendations();
  }

  async listRecommendations(): Promise<SeoRecommendationItem[]> {
    let rows = await (this.prisma as unknown as {
      seoRecommendation: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).seoRecommendation.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) {
      const pulseflexProductId = await this.contentPipelineService.getProductIdBySlug("pulseflex-knee-sleeve");
      await this.seedRecommendationDrafts(pulseflexProductId);
      rows = await (this.prisma as unknown as {
        seoRecommendation: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
      }).seoRecommendation.findMany({
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      });
    }

    return rows.map((row) => mapRecommendation(row));
  }

  async applyRecommendation(recommendationId: string, actor: SeoAdminActor) {
    let recommendation = await (this.prisma as unknown as {
      seoRecommendation: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).seoRecommendation.findUnique({ where: { id: recommendationId } });
    if (!recommendation) {
      await this.generateRecommendations();
      recommendation = await (this.prisma as unknown as {
        seoRecommendation: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
      }).seoRecommendation.findUnique({ where: { id: recommendationId } });
    }
    if (!recommendation) {
      throw new NotFoundException({ code: "SEO_RECOMMENDATION_NOT_FOUND", message: "Recommendation not found" });
    }

    const mappedRecommendation = mapRecommendation(recommendation);
    if (mappedRecommendation.resourceType === "product" && mappedRecommendation.resourceId) {
      const draft = await this.contentPipelineService.generateProductSeoDraft(mappedRecommendation.resourceId);
      if ("seoTitle" in mappedRecommendation.draftPayload && typeof mappedRecommendation.draftPayload.seoTitle === "string") {
        draft.seoTitle = mappedRecommendation.draftPayload.seoTitle;
      }
      if ("seoDescription" in mappedRecommendation.draftPayload && typeof mappedRecommendation.draftPayload.seoDescription === "string") {
        draft.seoDescription = mappedRecommendation.draftPayload.seoDescription;
      }
      await this.contentPipelineService.applyProductSeoDraft(mappedRecommendation.resourceId, draft, actor);
    }

    const updated = await (this.prisma as unknown as {
      seoRecommendation: { update: (args: unknown) => Promise<Record<string, unknown>> };
    }).seoRecommendation.update({
      where: { id: recommendationId },
      data: { status: "APPLIED", appliedAt: new Date() },
    });

    return mapRecommendation(updated);
  }

  async rejectRecommendation(recommendationId: string, actor: SeoAdminActor) {
    let recommendation = await (this.prisma as unknown as {
      seoRecommendation: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).seoRecommendation.findUnique({ where: { id: recommendationId } });
    if (!recommendation) {
      await this.generateRecommendations();
      recommendation = await (this.prisma as unknown as {
        seoRecommendation: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
      }).seoRecommendation.findUnique({ where: { id: recommendationId } });
    }
    if (!recommendation) {
      throw new NotFoundException({ code: "SEO_RECOMMENDATION_NOT_FOUND", message: "Recommendation not found" });
    }

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.adminId,
        action: "SEO_RECOMMENDATION_REJECTED",
        resource: "seo_recommendation",
        resourceId: recommendationId,
        details: { actorEmail: actor.adminEmail },
      },
    });

    const updated = await (this.prisma as unknown as {
      seoRecommendation: { update: (args: unknown) => Promise<Record<string, unknown>> };
    }).seoRecommendation.update({
      where: { id: recommendationId },
      data: { status: "REJECTED" },
    });

    return mapRecommendation(updated);
  }

  private async seedRecommendationDrafts(pulseflexProductId: string) {
    for (const draft of recommendationDrafts) {
      const resourceId = draft.resourceType === "product" ? pulseflexProductId : null;
      await (this.prisma as unknown as {
        seoRecommendation: { upsert: (args: unknown) => Promise<unknown> };
      }).seoRecommendation.upsert({
        where: { id: draft.id },
        update: {
          recommendationType: draft.recommendationType,
          resourceType: draft.resourceType,
          resourceId,
          reason: draft.reason,
          priority: draft.priority,
          draftPayload: draft.draftPayload,
          isAiDraft: true,
        } as Record<string, unknown>,
        create: {
          id: draft.id,
          recommendationType: draft.recommendationType,
          resourceType: draft.resourceType,
          resourceId,
          reason: draft.reason,
          priority: draft.priority,
          status: "DRAFT",
          draftPayload: draft.draftPayload,
          isAiDraft: true,
        } as Record<string, unknown>,
      });
    }
  }

  private async enhanceRecommendationDraftsWithAi(pulseflexProductId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: pulseflexProductId },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        category: true,
        seoTitle: true,
        seoDescription: true,
      },
    });
    if (!product) {
      return;
    }

    const items = await this.seoAiRuntime.rewriteRecommendationDrafts({
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        category: product.category,
        shortDescription: product.shortDescription,
        description: product.description,
        currentSeoTitle: product.seoTitle,
        currentSeoDescription: product.seoDescription,
      },
      recommendations: recommendationDrafts.map((draft) => ({
        id: draft.id,
        recommendationType: draft.recommendationType,
        resourceType: draft.resourceType,
        pageUrl: draft.pageUrl,
        priority: draft.priority,
        currentReason: draft.reason,
        currentDraftPayload: draft.draftPayload,
      })),
    });

    for (const item of items) {
      const record = asRecord(item);
      const id = asString(record.id);
      if (!id) continue;
      const reason = asString(record.reason);
      const draftPayload = asRecord(record.draftPayload);
      const cleanedDraftPayload = Object.fromEntries(
        Object.entries(draftPayload).filter(([, value]) => typeof value === "string" && value.trim().length > 0),
      );
      if (!reason && Object.keys(cleanedDraftPayload).length === 0) continue;

      await (this.prisma as unknown as {
        seoRecommendation: { update: (args: unknown) => Promise<unknown> };
      }).seoRecommendation.update({
        where: { id },
        data: {
          ...(reason ? { reason } : {}),
          ...(Object.keys(cleanedDraftPayload).length > 0 ? { draftPayload: cleanedDraftPayload } : {}),
          isAiDraft: true,
        },
      });
    }
  }
}
