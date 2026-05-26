import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { AlibabaLinkImportCommitDto, AlibabaLinkImportPreviewDto } from "./dto/alibaba-import.dto";
import type { AiImportCommitDto, AiImportPreviewDto } from "./dto/ai-import.dto";
import type { CsvImportCommitDto, CsvImportPreviewDto } from "./dto/csv-import.dto";
import type { SupplierQuoteImportCommitDto, SupplierQuoteImportPreviewDto } from "./dto/supplier-quote-import.dto";
import { evaluateCandidateRisk } from "./product-research.engine";
import type { CandidateImportDraft } from "./product-research.provider";
import { ProductResearchAssessmentService } from "./product-research-assessment.service";
import { ProductResearchRuntimeService } from "./product-research-runtime.service";
import {
  type AdminActor,
  candidateDetailInclude,
  joinNotes,
  candidateDuplicateKey,
  loadCandidateDuplicateMap,
  loadSuppliersByUrlMap,
  mergeTextFields,
  normalizeCandidateCsvRow,
  normalizeLinkList,
  normalizePreviewItem,
  normalizeSupplierQuoteRow,
} from "./product-research.shared";

@Injectable()
export class ProductResearchImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly runtime: ProductResearchRuntimeService,
    private readonly assessmentService: ProductResearchAssessmentService,
  ) {}

  async previewAiImport(payload: AiImportPreviewDto) {
    const count = payload.count ?? 10;
    const items = await this.runtime.generateCandidates({
      brandDirection: payload.brandDirection,
      targetMarket: payload.targetMarket,
      excludedCategories: payload.excludedCategories,
      count,
    });

    const duplicates = await this.findDuplicatePreviewMatches(items);
    const previewItems = items.map((item, index) => ({
      ...item,
      duplicateHints: duplicates.filter((entry) => entry.index === index).map((entry) => entry.existingId),
      riskWarnings: evaluateCandidateRisk(item).flags.map((flag) => `${flag.severity}: ${flag.message}`),
    }));

    return {
      items: previewItems,
      requestedCount: count,
      duplicates,
      riskWarnings: previewItems.flatMap((item, index) => item.riskWarnings?.map((warning) => ({ index, warning })) ?? []),
    };
  }

  async commitAiImport(payload: AiImportCommitDto, actor?: AdminActor) {
    const previewItems = Array.isArray(payload.previewItems) ? payload.previewItems : [];
    const indexes = new Set((payload.selectedIndexes ?? []).filter((value) => Number.isInteger(value) && value >= 0));
    const selected = previewItems.filter((_, index) => indexes.has(index)).map(normalizePreviewItem);
    if (selected.length === 0) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_IMPORT_EMPTY_SELECTION", message: "No preview rows selected" });
    }

    const batch = await this.prisma.productResearchImportBatch.create({
      data: {
        source: "AI",
        fileName: "ai-generated-preview",
        totalRows: previewItems.length,
        createdById: actor?.adminId ?? null,
      },
    });

    return this.commitCandidateImportBatch({
      batchId: batch.id,
      rows: selected,
      importSource: "AI_GENERATED",
      actor,
      duplicateAction: "skip",
    });
  }

  async previewCsvImport(payload: CsvImportPreviewDto) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const normalized = rows.map((row, index) => normalizeCandidateCsvRow(row, index));
    const invalidRows = normalized.filter((row) => row.errors.length > 0).map((row) => ({ index: row.index, errors: row.errors, row: row.original }));
    const validItems = normalized.filter((row) => row.errors.length === 0).map((row) => row.draft);
    const duplicates = await this.findDuplicatePreviewMatches(validItems);

    return {
      fileName: payload.fileName ?? null,
      previewRows: validItems,
      duplicates,
      invalidRows,
    };
  }

  async commitCsvImport(payload: CsvImportCommitDto, actor?: AdminActor) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const normalized = rows.map((row, index) => normalizeCandidateCsvRow(row, index));
    const invalidRows = normalized.filter((row) => row.errors.length > 0);
    if (invalidRows.length > 0) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_IMPORT_INVALID_ROWS", message: "CSV import includes invalid rows" });
    }

    const batch = await this.prisma.productResearchImportBatch.create({
      data: {
        source: "CSV",
        fileName: payload.batchId ?? "candidate-csv",
        totalRows: rows.length,
        createdById: actor?.adminId ?? null,
      },
    });

    return this.commitCandidateImportBatch({
      batchId: batch.id,
      rows: normalized.map((row) => row.draft),
      importSource: "CSV",
      actor,
      duplicateAction: payload.action ?? "skip",
    });
  }

  async previewSupplierQuoteImport(payload: SupplierQuoteImportPreviewDto) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const normalized = rows.map((row, index) => normalizeSupplierQuoteRow(row, index));
    const invalidRows = normalized.filter((row) => row.errors.length > 0).map((row) => ({ index: row.index, errors: row.errors, row: row.original }));
    const validRows = normalized.filter((row) => row.errors.length === 0);
    const supplierMap = await loadSuppliersByUrlMap(
      this.prisma,
      validRows.map((row) => row.supplierUrl),
    );
    const duplicates = validRows
      .filter((row) => row.supplierUrl)
      .map((row) => {
        const existing = supplierMap.get(row.supplierUrl!.trim().toLowerCase());
        if (!existing) {
          return null;
        }
        return {
          index: row.index,
          supplierUrl: row.supplierUrl,
          existingSupplierId: existing.id,
          existingSupplierName: existing.name,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return {
      fileName: payload.fileName ?? null,
      previewRows: normalized.filter((row) => row.errors.length === 0).map((row) => row.preview),
      duplicates,
      invalidRows,
    };
  }

  async commitSupplierQuoteImport(payload: SupplierQuoteImportCommitDto, actor?: AdminActor) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const normalized = rows.map((row, index) => normalizeSupplierQuoteRow(row, index));
    const invalidRows = normalized.filter((row) => row.errors.length > 0);
    if (invalidRows.length > 0) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_SUPPLIER_IMPORT_INVALID_ROWS", message: "Supplier import includes invalid rows" });
    }

    const batch = await this.prisma.productResearchImportBatch.create({
      data: {
        source: "SUPPLIER_QUOTE",
        fileName: payload.batchId ?? "supplier-quote-csv",
        totalRows: rows.length,
        createdById: actor?.adminId ?? null,
      },
    });

    let createdCount = 0;
    let duplicateCount = 0;
    let skippedCount = 0;

    for (const row of normalized) {
      const existingSupplier = row.supplierUrl
        ? await this.prisma.supplier.findFirst({
            where: {
              url: { equals: row.supplierUrl, mode: "insensitive" },
            },
          })
        : null;

      if (existingSupplier && payload.action === "skip") {
        duplicateCount += 1;
        skippedCount += 1;
        continue;
      }

      const supplier = existingSupplier
        ? await this.prisma.supplier.update({
            where: { id: existingSupplier.id },
            data: row.supplierData,
          })
        : await this.prisma.supplier.create({
            data: row.supplierData,
          });

      const candidate = await this.findCandidateByName(row.productName);
      if (candidate) {
        await this.prisma.productCandidateSupplier.upsert({
          where: {
            candidateId_supplierId: {
              candidateId: candidate.id,
              supplierId: supplier.id,
            },
          },
          create: {
            candidateId: candidate.id,
            supplierId: supplier.id,
            quotedUnitPriceCents: row.quoteData.quotedUnitPriceCents,
            quotedMoq: row.quoteData.quotedMoq,
            quotedLeadTimeDays: row.quoteData.quotedLeadTimeDays,
            notes: row.quoteData.notes,
          },
          update: row.quoteData,
        });
        await this.assessmentService.refreshCandidateAssessment(candidate.id, actor);
      }

      createdCount += 1;
      if (existingSupplier) duplicateCount += 1;
    }

    await this.prisma.productResearchImportBatch.update({
      where: { id: batch.id },
      data: {
        createdCount,
        skippedCount,
        duplicateCount,
        invalidCount: 0,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor?.adminId ?? null,
        action: "PRODUCT_RESEARCH_SUPPLIER_QUOTES_IMPORTED",
        resource: "product_research_import_batch",
        resourceId: batch.id,
        details: {
          createdCount,
          duplicateCount,
          skippedCount,
          actorEmail: actor?.adminEmail ?? null,
        },
      },
    });

    return {
      batchId: batch.id,
      importedCount: createdCount,
      duplicateCount,
      skippedCount,
    };
  }

  async previewAlibabaLinks(payload: AlibabaLinkImportPreviewDto) {
    const links = normalizeLinkList(payload.links);
    const previewItems = await this.runtime.enrichAlibabaLinks({ links, notes: payload.notes ?? null });
    const duplicates = await this.findDuplicatePreviewMatches(previewItems);

    return {
      links,
      notes: payload.notes ?? null,
      previewItems: previewItems.map((item, index) => ({
        ...item,
        duplicateHints: duplicates.filter((entry) => entry.index === index).map((entry) => entry.existingId),
        riskWarnings: evaluateCandidateRisk(item).flags.map((flag) => `${flag.severity}: ${flag.message}`),
      })),
      duplicates,
    };
  }

  async commitAlibabaLinks(payload: AlibabaLinkImportCommitDto, actor?: AdminActor) {
    const previewItems = Array.isArray(payload.previewItems) ? payload.previewItems : [];
    const indexes = new Set((payload.selectedIndexes ?? []).filter((value) => Number.isInteger(value) && value >= 0));
    const selected = previewItems.filter((_, index) => indexes.has(index)).map(normalizePreviewItem);
    if (selected.length === 0) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_IMPORT_EMPTY_SELECTION", message: "No Alibaba preview rows selected" });
    }

    const batch = await this.prisma.productResearchImportBatch.create({
      data: {
        source: "ALIBABA_LINK",
        fileName: "alibaba-links",
        totalRows: previewItems.length,
        createdById: actor?.adminId ?? null,
      },
    });

    return this.commitCandidateImportBatch({
      batchId: batch.id,
      rows: selected.map((item) => ({ ...item, notes: joinNotes(item.notes, payload.notes) })),
      importSource: "ALIBABA_LINK",
      actor,
      duplicateAction: "skip",
    });
  }

  async createCandidateRecord(seed: CandidateImportDraft, actor?: AdminActor) {
    const duplicate = await this.prisma.productCandidate.findFirst({
      where: {
        productName: { equals: seed.productName, mode: "insensitive" },
        category: { equals: seed.category, mode: "insensitive" },
        targetMarket: { equals: seed.targetMarket, mode: "insensitive" },
      },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    return this.prisma.$transaction(async (tx) => {
      const candidate = await tx.productCandidate.create({
        data: {
          productName: seed.productName,
          chineseName: seed.chineseName ?? null,
          slugSuggestion: seed.slugSuggestion ?? null,
          category: seed.category,
          targetMarket: seed.targetMarket,
          targetAudience: seed.targetAudience ?? null,
          useCase: seed.useCase ?? null,
          description: seed.description ?? null,
          notes: seed.notes ?? null,
          brandAngle: seed.brandAngle ?? null,
          positioningSummary: seed.positioningSummary ?? null,
          alibabaKeywords: seed.alibabaKeywords ?? null,
          source: seed.source,
          sourceUrl: seed.sourceUrl ?? null,
          rawImportData: seed.rawImportData ?? Prisma.JsonNull,
          aiDraftPayload: seed.aiDraftPayload ?? Prisma.JsonNull,
          possibleDuplicateOfId: duplicate?.id ?? null,
          createdById: actor?.adminId ?? null,
        },
        include: candidateDetailInclude,
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_CANDIDATE_CREATED",
          resource: "product_research_candidate",
          resourceId: candidate.id,
          details: {
            productName: candidate.productName,
            source: candidate.source,
            targetMarket: candidate.targetMarket,
            possibleDuplicateOfId: candidate.possibleDuplicateOfId,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });

      return candidate;
    });
  }

  async commitCandidateImportBatch(input: {
    batchId: string;
    rows: CandidateImportDraft[];
    importSource: "AI_GENERATED" | "CSV" | "ALIBABA_LINK";
    actor?: AdminActor;
    duplicateAction: "merge" | "skip" | "create_anyway";
  }) {
    let createdCount = 0;
    let duplicateCount = 0;
    let skippedCount = 0;
    const createdIds: string[] = [];
    const assessmentIds: string[] = [];
    const duplicateMap = await loadCandidateDuplicateMap(this.prisma, input.rows);

    for (const row of input.rows) {
      const duplicate = duplicateMap.get(candidateDuplicateKey(row));

      if (duplicate) {
        duplicateCount += 1;
        if (input.duplicateAction === "skip") {
          skippedCount += 1;
          continue;
        }
        if (input.duplicateAction === "merge") {
          await this.prisma.productCandidate.update({
            where: { id: duplicate.id },
            data: {
              notes: mergeTextFields(duplicate.notes, row.notes),
              sourceUrl: duplicate.sourceUrl ?? row.sourceUrl ?? null,
              alibabaKeywords: duplicate.alibabaKeywords ?? row.alibabaKeywords ?? null,
              rawImportData: row.rawImportData ?? undefined,
              aiDraftPayload: row.aiDraftPayload ?? undefined,
            },
          });
          assessmentIds.push(duplicate.id);
          continue;
        }
      }

      const created = await this.createCandidateRecord({ ...row, source: input.importSource }, input.actor);
      createdIds.push(created.id);
      createdCount += 1;
      assessmentIds.push(created.id);
    }

    if (assessmentIds.length > 0) {
      await this.assessmentService.refreshCandidateAssessments(assessmentIds, input.actor);
    }

    await this.prisma.productResearchImportBatch.update({
      where: { id: input.batchId },
      data: {
        createdCount,
        skippedCount,
        duplicateCount,
        invalidCount: 0,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actor?.adminId ?? null,
        action: "PRODUCT_RESEARCH_IMPORT_BATCH_COMMITTED",
        resource: "product_research_import_batch",
        resourceId: input.batchId,
        details: {
          createdCount,
          duplicateCount,
          skippedCount,
          createdIds,
          actorEmail: input.actor?.adminEmail ?? null,
        },
      },
    });

    return {
      batchId: input.batchId,
      importedCount: createdCount,
      duplicateCount,
      skippedCount,
      createdIds,
    };
  }

  async findDuplicatePreviewMatches(items: CandidateImportDraft[]) {
    const duplicateMap = await loadCandidateDuplicateMap(this.prisma, items);
    const matches: Array<{ index: number; existingId: string }> = [];

    for (const [index, item] of items.entries()) {
      const existing = duplicateMap.get(candidateDuplicateKey(item));
      if (existing) {
        matches.push({ index, existingId: existing.id });
      }
    }

    return matches;
  }

  async findCandidateByName(productName: string) {
    return this.prisma.productCandidate.findFirst({
      where: { productName: { equals: productName, mode: "insensitive" } },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
  }
}
