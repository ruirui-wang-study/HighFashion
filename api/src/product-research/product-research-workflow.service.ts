import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import type { DecisionCreateDto } from "./dto/decision-create.dto";
import type { SupplierQuoteUpdateDto } from "./dto/supplier-quote-update.dto";
import type { TestLaunchUpsertDto } from "./dto/test-launch-upsert.dto";
import { calculateTestScore, calculateValidatedScore } from "./product-research.engine";
import { ProductResearchAssessmentService } from "./product-research-assessment.service";
import {
  type AdminActor,
  asRecord,
  asString,
  asStringArray,
  buildAvailableProductSlug,
  defaultBenefits,
  defaultFeatures,
  ensureCandidateExists,
  enumString,
  mapCandidateStatusFromDecision,
  ratio,
} from "./product-research.shared";

@Injectable()
export class ProductResearchWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assessmentService: ProductResearchAssessmentService,
  ) {}

  async upsertSupplierQuote(candidateId: string, supplierId: string, payload: SupplierQuoteUpdateDto, actor?: AdminActor) {
    await ensureCandidateExists(this.prisma, candidateId);
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      throw new NotFoundException({ code: "PRODUCT_RESEARCH_SUPPLIER_NOT_FOUND", message: "Supplier not found" });
    }

    const result = await this.prisma.productCandidateSupplier.upsert({
      where: {
        candidateId_supplierId: {
          candidateId,
          supplierId,
        },
      },
      create: {
        candidateId,
        supplierId,
        quotedUnitPriceCents: payload.quotedUnitPriceCents ?? null,
        quotedMoq: payload.quotedMoq ?? null,
        quotedLeadTimeDays: payload.quotedLeadTimeDays ?? null,
        quoteFileUrl: payload.quoteFileUrl?.trim() || null,
        notes: payload.notes?.trim() || null,
      },
      update: {
        quotedUnitPriceCents: payload.quotedUnitPriceCents ?? null,
        quotedMoq: payload.quotedMoq ?? null,
        quotedLeadTimeDays: payload.quotedLeadTimeDays ?? null,
        quoteFileUrl: payload.quoteFileUrl?.trim() || null,
        notes: payload.notes?.trim() || null,
      },
      include: {
        supplier: true,
      },
    });

    await this.assessmentService.refreshCandidateAssessment(candidateId, actor);
    return result;
  }

  async createDecision(candidateId: string, payload: DecisionCreateDto, actor?: AdminActor) {
    await ensureCandidateExists(this.prisma, candidateId);
    const decision = enumString(payload.decision, ["SAMPLE", "TEST", "WATCH", "APPROVE", "REJECT", "CONVERT_TO_PRODUCT"]);

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.productResearchDecision.create({
        data: {
          candidateId,
          decision: decision as never,
          reason: payload.reason?.trim() || null,
          operatorId: actor?.adminId ?? null,
        },
      });

      await tx.productCandidate.update({
        where: { id: candidateId },
        data: mapCandidateStatusFromDecision(decision, actor),
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_DECISION_CREATED",
          resource: "product_research_candidate",
          resourceId: candidateId,
          details: {
            decision,
            reason: payload.reason?.trim() || null,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });

      return created;
    });
  }

  async upsertTestLaunch(candidateId: string, payload: TestLaunchUpsertDto, actor?: AdminActor) {
    await ensureCandidateExists(this.prisma, candidateId);
    if (!payload.channel?.trim()) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_TEST_CHANNEL_REQUIRED", message: "Test launch channel is required" });
    }

    const ctr = ratio(payload.clicks ?? 0, payload.impressions ?? 0);
    const addToCartRate = ratio(payload.addToCart ?? 0, payload.productViews ?? 0);
    const checkoutRate = ratio(payload.beginCheckout ?? 0, payload.productViews ?? 0);
    const purchaseRate = ratio(payload.purchases ?? 0, payload.productViews ?? 0);
    const testScore = calculateTestScore({
      ctr,
      addToCartRate,
      checkoutRate,
      purchaseRate,
      productViews: payload.productViews ?? 0,
      customerFeedbackScore: payload.customerFeedbackScore ?? null,
      refundRiskScore: payload.refundRiskScore ?? null,
    });

    const launch = await this.prisma.productTestLaunch.create({
      data: {
        candidateId,
        landingPageUrl: payload.landingPageUrl?.trim() || null,
        channel: payload.channel.trim(),
        channelDetail: payload.channelDetail?.trim() || null,
        adSpendCents: payload.adSpendCents ?? 0,
        impressions: payload.impressions ?? 0,
        clicks: payload.clicks ?? 0,
        ctr,
        productViews: payload.productViews ?? 0,
        addToCart: payload.addToCart ?? 0,
        addToCartRate,
        beginCheckout: payload.beginCheckout ?? 0,
        checkoutRate,
        purchases: payload.purchases ?? 0,
        purchaseRate,
        revenueCents: payload.revenueCents ?? 0,
        refunds: payload.refunds ?? 0,
        customerFeedbackScore: payload.customerFeedbackScore ?? null,
        refundRiskScore: payload.refundRiskScore ?? null,
        customerFeedbackSummary: payload.customerFeedbackSummary?.trim() || null,
        status: (payload.status as never) ?? "PLANNED",
        testScore,
        startedAt: payload.startedAt ? new Date(payload.startedAt) : null,
        endedAt: payload.endedAt ? new Date(payload.endedAt) : null,
        notes: payload.notes?.trim() || null,
      },
    });

    const candidate = await this.prisma.productCandidate.findUniqueOrThrow({
      where: { id: candidateId },
      select: { finalScore: true },
    });
    const validatedScore = calculateValidatedScore(candidate.finalScore, testScore);

    await this.prisma.productCandidate.update({
      where: { id: candidateId },
      data: {
        validatedScore,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor?.adminId ?? null,
        action: "PRODUCT_RESEARCH_TEST_LAUNCH_CREATED",
        resource: "product_research_candidate",
        resourceId: candidateId,
        details: {
          channel: payload.channel.trim(),
          testScore,
          validatedScore,
          actorEmail: actor?.adminEmail ?? null,
        },
      },
    });

    return launch;
  }

  async convertToProductDraft(id: string, actor?: AdminActor) {
    const candidate = await this.prisma.productCandidate.findUnique({
      where: { id },
      include: {
        riskFlags: true,
      },
    });
    if (!candidate) {
      throw new NotFoundException({ code: "PRODUCT_RESEARCH_CANDIDATE_NOT_FOUND", message: "Candidate not found" });
    }
    if (candidate.status !== "APPROVED") {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_CONVERT_REQUIRES_APPROVAL", message: "Only approved candidates can convert to product drafts" });
    }
    if (candidate.riskFlags.some((flag) => flag.severity === "BLOCKING" && !flag.resolvedAt)) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_CONVERT_BLOCKED_BY_RISK", message: "Blocking risk flags must be resolved before convert" });
    }
    if (candidate.convertedProductId) {
      return {
        candidateId: candidate.id,
        productId: candidate.convertedProductId,
        status: "DRAFT",
      };
    }

    const aiDraft = asRecord(candidate.aiDraftPayload);
    const features = asStringArray(aiDraft.features);
    const benefits = asStringArray(aiDraft.benefits);
    const useCases = candidate.useCase ? [candidate.useCase] : [];

    const created = await this.prisma.$transaction(async (tx) => {
      const slug = await buildAvailableProductSlug(tx, candidate.slugSuggestion || candidate.productName);
      const product = await tx.product.create({
        data: {
          title: candidate.productName,
          titleEn: candidate.productName,
          titleZh: candidate.chineseName || null,
          slug,
          category: candidate.category,
          shortDescription: candidate.positioningSummary || candidate.description || `${candidate.productName} product research draft`,
          shortDescriptionEn: candidate.positioningSummary || candidate.description || `${candidate.productName} product research draft`,
          shortDescriptionZh: candidate.chineseName ? `${candidate.chineseName} 商品草稿` : null,
          description: candidate.description || candidate.positioningSummary || `${candidate.productName} pending merchandising review.`,
          descriptionEn: candidate.description || candidate.positioningSummary || `${candidate.productName} pending merchandising review.`,
          descriptionZh: candidate.chineseName ? `${candidate.chineseName} 待商品化审核。` : null,
          seoTitle: asString(aiDraft.seoTitle) || `${candidate.productName} | PulseGear`,
          seoTitleEn: asString(aiDraft.seoTitle) || `${candidate.productName} | PulseGear`,
          seoTitleZh: candidate.chineseName ? `${candidate.chineseName} | PulseGear` : null,
          seoDescription: asString(aiDraft.seoDescription) || candidate.positioningSummary || candidate.description || null,
          seoDescriptionEn: asString(aiDraft.seoDescription) || candidate.positioningSummary || candidate.description || null,
          seoDescriptionZh: candidate.chineseName ? `${candidate.chineseName} 商品草稿，待运营完善。` : null,
          status: "DRAFT",
          badge: "Research Draft",
          benefits: benefits.length ? benefits : defaultBenefits(candidate),
          benefitsEn: benefits.length ? benefits : defaultBenefits(candidate),
          features: features.length ? features : defaultFeatures(candidate),
          featuresEn: features.length ? features : defaultFeatures(candidate),
          useCases,
          bundleEligible: false,
        },
      });

      await tx.productCandidate.update({
        where: { id: candidate.id },
        data: {
          convertedProductId: product.id,
        },
      });

      await tx.productResearchDecision.create({
        data: {
          candidateId: candidate.id,
          decision: "CONVERT_TO_PRODUCT",
          reason: "Converted to product draft",
          operatorId: actor?.adminId ?? null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_CONVERTED_TO_PRODUCT_DRAFT",
          resource: "product_research_candidate",
          resourceId: candidate.id,
          details: {
            productId: product.id,
            slug: product.slug,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });

      return product;
    });

    return {
      candidateId: candidate.id,
      productId: created.id,
      status: created.status,
    };
  }
}
