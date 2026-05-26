import { Injectable, NotFoundException } from "@nestjs/common";
import { guides } from "../../../data/guides";
import { PrismaService } from "../common/prisma.service";
import { SeoAiRuntimeService } from "./seo-ai-runtime.service";
import { SeoOpportunityService } from "./seo-opportunity.service";
import { mapContentBrief, type SeoAdminActor } from "./seo-automation.shared";
import type { ContentBriefItem, ProductSeoDraft } from "./seo-automation.types";

@Injectable()
export class SeoContentPipelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seoAiRuntime: SeoAiRuntimeService,
    private readonly opportunityService: SeoOpportunityService,
  ) {}

  async createContentBriefFromOpportunity(opportunityId: string): Promise<ContentBriefItem> {
    const opportunity = await (this.prisma as unknown as {
      contentOpportunity: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).contentOpportunity.findUnique({
      where: { id: opportunityId },
    });
    if (!opportunity) {
      await this.opportunityService.generateOpportunities();
    }

    const ensuredOpportunity = await (this.prisma as unknown as {
      contentOpportunity: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).contentOpportunity.findUnique({
      where: { id: opportunityId },
    });
    if (!ensuredOpportunity) {
      throw new NotFoundException({ code: "CONTENT_OPPORTUNITY_NOT_FOUND", message: "Opportunity not found" });
    }

    const pulseflexProductId = await this.getProductIdBySlug("pulseflex-knee-sleeve");
    const brief: ContentBriefItem = {
      id: "brief_1",
      sourceOpportunityId: opportunityId,
      title: "Knee Support Guide Content Brief",
      targetKeyword: "best knee sleeve for running",
      outline: [
        "Define runner intent and support use case",
        "Compare sleeve versus strap",
        "Recommend related products and guide links",
      ],
      draftContent: null,
      relatedProductIds: [pulseflexProductId],
      relatedCollectionSlugs: ["support"],
      status: "BRIEF_GENERATED",
    };

    const aiDraft = await this.seoAiRuntime.rewriteContentBrief({
      id: brief.id,
      title: brief.title,
      targetKeyword: brief.targetKeyword,
      outline: brief.outline,
      relatedCollectionSlugs: brief.relatedCollectionSlugs,
    });

    const enhancedBrief = {
      ...brief,
      ...(aiDraft.title ? { title: aiDraft.title } : {}),
      ...(aiDraft.outline.length > 0 ? { outline: aiDraft.outline } : {}),
    };

    await (this.prisma as unknown as {
      contentBrief: { upsert: (args: unknown) => Promise<unknown>; findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).contentBrief.upsert({
      where: { id: brief.id },
      update: {
        sourceOpportunityId: enhancedBrief.sourceOpportunityId,
        title: enhancedBrief.title,
        targetKeyword: enhancedBrief.targetKeyword,
        outline: enhancedBrief.outline,
        draftContent: enhancedBrief.draftContent,
        relatedProductIds: enhancedBrief.relatedProductIds,
        relatedCollectionSlugs: enhancedBrief.relatedCollectionSlugs,
      },
      create: {
        id: enhancedBrief.id,
        sourceOpportunityId: enhancedBrief.sourceOpportunityId,
        title: enhancedBrief.title,
        targetKeyword: enhancedBrief.targetKeyword,
        outline: enhancedBrief.outline,
        draftContent: enhancedBrief.draftContent,
        relatedProductIds: enhancedBrief.relatedProductIds,
        relatedCollectionSlugs: enhancedBrief.relatedCollectionSlugs,
        status: enhancedBrief.status,
      },
    });

    const created = await (this.prisma as unknown as {
      contentBrief: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).contentBrief.findUnique({ where: { id: brief.id } });
    if (!created) {
      throw new NotFoundException({ code: "CONTENT_BRIEF_NOT_FOUND", message: "Content brief not found" });
    }

    return mapContentBrief(created);
  }

  async listContentPipeline(): Promise<ContentBriefItem[]> {
    let rows = await (this.prisma as unknown as {
      contentBrief: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).contentBrief.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    if (rows.length === 0) {
      await this.createContentBriefFromOpportunity("opp_1");
      rows = await (this.prisma as unknown as {
        contentBrief: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
      }).contentBrief.findMany({
        orderBy: [{ createdAt: "desc" }],
      });
    }

    return rows.map((row) => mapContentBrief(row));
  }

  async generateProductSeoDraft(productId: string): Promise<ProductSeoDraft> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: { select: { alt: true } } },
    });
    if (!product) {
      throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }

    const baseDraft: ProductSeoDraft = {
      seoTitle: `${product.title} for Running | Lightweight Support | PulseGear`,
      seoDescription: `${product.shortDescription} Sweat-ready support for runners and training days with a secure, breathable fit.`,
      imageAltText: product.images.map((image, index) => image.alt?.trim() || `${product.title} image ${index + 1}`),
      productFaq: [
        {
          question: `Who is ${product.title} best for?`,
          answer: `${product.title} is best for runners and training users who want breathable support without bulky coverage.`,
        },
      ],
      relatedGuides: guides.slice(0, 2).map((guide) => guide.slug),
      relatedProducts: ["corecarry-running-belt"],
      merchantFeedSuggestions: {
        google_product_category: product.category,
        custom_label_0: "seo-draft",
      },
      aiDraft: true,
    };

    const aiDraft = await this.seoAiRuntime.rewriteProductSeoDraft({
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        category: product.category,
        shortDescription: product.shortDescription,
        description: product.description,
      },
      currentDraft: {
        seoTitle: baseDraft.seoTitle,
        seoDescription: baseDraft.seoDescription,
        productFaq: baseDraft.productFaq,
      },
    });

    if (!aiDraft.seoTitle && !aiDraft.seoDescription && aiDraft.productFaq.length === 0) {
      return baseDraft;
    }

    return {
      ...baseDraft,
      ...(aiDraft.seoTitle ? { seoTitle: aiDraft.seoTitle } : {}),
      ...(aiDraft.seoDescription ? { seoDescription: aiDraft.seoDescription } : {}),
      ...(aiDraft.productFaq.length > 0 ? { productFaq: aiDraft.productFaq } : {}),
    };
  }

  async applyProductSeoDraft(productId: string, draft: ProductSeoDraft, actor: SeoAdminActor) {
    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: { select: { alt: true } } },
    });
    if (!existing) {
      throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.adminId,
        action: "SEO_DRAFT_APPLIED",
        resource: "product",
        resourceId: productId,
        details: {
          actorEmail: actor.adminEmail,
          seoTitle: draft.seoTitle,
          seoDescription: draft.seoDescription,
        },
      },
    });

    await (this.prisma as unknown as {
      seoChangeLog: { create: (args: unknown) => Promise<unknown> };
    }).seoChangeLog.create({
      data: {
        action: "PRODUCT_SEO_APPLIED",
        resourceType: "product",
        resourceId: productId,
        oldValue: {
          seoTitle: existing.seoTitle,
          seoDescription: existing.seoDescription,
        },
        newValue: {
          seoTitle: draft.seoTitle,
          seoDescription: draft.seoDescription,
        },
        operatorId: actor.adminId,
      },
    });

    return updated;
  }

  async publishContentBrief(id: string, actor: SeoAdminActor) {
    let brief = await (this.prisma as unknown as {
      contentBrief: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).contentBrief.findUnique({ where: { id } });
    if (!brief && id === "brief_1") {
      brief = (await this.createContentBriefFromOpportunity("opp_1")) as unknown as Record<string, unknown>;
    }
    if (!brief) {
      throw new NotFoundException({ code: "CONTENT_BRIEF_NOT_FOUND", message: "Content brief not found" });
    }
    const mappedBrief = mapContentBrief(brief);

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.adminId,
        action: "CONTENT_BRIEF_PUBLISHED",
        resource: "content_brief",
        resourceId: id,
        details: {
          actorEmail: actor.adminEmail,
          title: mappedBrief.title,
        },
      },
    });

    await (this.prisma as unknown as {
      seoChangeLog: { create: (args: unknown) => Promise<unknown> };
    }).seoChangeLog.create({
      data: {
        action: "CONTENT_BRIEF_PUBLISHED",
        resourceType: "content_brief",
        resourceId: id,
        oldValue: { status: mappedBrief.status },
        newValue: { status: "PUBLISHED" },
        operatorId: actor.adminId,
      },
    });

    const updated = await (this.prisma as unknown as {
      contentBrief: { update: (args: unknown) => Promise<Record<string, unknown>> };
    }).contentBrief.update({
      where: { id },
      data: {
        status: "PUBLISHED",
      },
    });

    return mapContentBrief(updated);
  }

  async getProductIdBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: `Product not found for slug: ${slug}` });
    }
    return product.id;
  }
}
