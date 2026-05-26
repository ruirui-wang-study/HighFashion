import { Injectable } from "@nestjs/common";
import { AlibabaLinkImportCommitDto, AlibabaLinkImportPreviewDto } from "./dto/alibaba-import.dto";
import type { AiImportCommitDto, AiImportPreviewDto } from "./dto/ai-import.dto";
import { BulkCandidateActionDto } from "./dto/bulk-candidate-action.dto";
import type { CandidateQueryDto } from "./dto/candidate-query.dto";
import type { CsvImportCommitDto, CsvImportPreviewDto } from "./dto/csv-import.dto";
import type { CreateCandidateDto } from "./dto/create-candidate.dto";
import type { CreateScoringRuleDto } from "./dto/create-scoring-rule.dto";
import type { DecisionCreateDto } from "./dto/decision-create.dto";
import type { ScoreManualAdjustmentDto } from "./dto/score-manual-adjustment.dto";
import type { SupplierQuoteImportCommitDto, SupplierQuoteImportPreviewDto } from "./dto/supplier-quote-import.dto";
import type { SupplierQuoteUpdateDto } from "./dto/supplier-quote-update.dto";
import type { TestLaunchUpsertDto } from "./dto/test-launch-upsert.dto";
import { ProductResearchAssessmentService } from "./product-research-assessment.service";
import { ProductResearchCandidateService } from "./product-research-candidate.service";
import { ProductResearchImportService } from "./product-research-import.service";
import type { AdminActor } from "./product-research.shared";
import { ProductResearchWorkflowService } from "./product-research-workflow.service";

@Injectable()
export class ProductResearchService {
  constructor(
    private readonly candidateService: ProductResearchCandidateService,
    private readonly importService: ProductResearchImportService,
    private readonly assessmentService: ProductResearchAssessmentService,
    private readonly workflowService: ProductResearchWorkflowService,
  ) {}

  getDashboard() {
    return this.candidateService.getDashboard();
  }

  listCandidates(query: CandidateQueryDto) {
    return this.candidateService.listCandidates(query);
  }

  createCandidate(payload: CreateCandidateDto, actor?: AdminActor) {
    return this.candidateService.createCandidate(payload, actor);
  }

  getCandidateDetail(id: string) {
    return this.candidateService.getCandidateDetail(id);
  }

  previewAiImport(payload: AiImportPreviewDto) {
    return this.importService.previewAiImport(payload);
  }

  commitAiImport(payload: AiImportCommitDto, actor?: AdminActor) {
    return this.importService.commitAiImport(payload, actor);
  }

  previewCsvImport(payload: CsvImportPreviewDto) {
    return this.importService.previewCsvImport(payload);
  }

  commitCsvImport(payload: CsvImportCommitDto, actor?: AdminActor) {
    return this.importService.commitCsvImport(payload, actor);
  }

  previewSupplierQuoteImport(payload: SupplierQuoteImportPreviewDto) {
    return this.importService.previewSupplierQuoteImport(payload);
  }

  commitSupplierQuoteImport(payload: SupplierQuoteImportCommitDto, actor?: AdminActor) {
    return this.importService.commitSupplierQuoteImport(payload, actor);
  }

  previewAlibabaLinks(payload: AlibabaLinkImportPreviewDto) {
    return this.importService.previewAlibabaLinks(payload);
  }

  commitAlibabaLinks(payload: AlibabaLinkImportCommitDto, actor?: AdminActor) {
    return this.importService.commitAlibabaLinks(payload, actor);
  }

  listSuppliers() {
    return this.candidateService.listSuppliers();
  }

  listScoringRules() {
    return this.assessmentService.listScoringRules();
  }

  createScoringRule(payload: CreateScoringRuleDto, actor?: AdminActor) {
    return this.assessmentService.createScoringRule(payload, actor);
  }

  listImportBatches() {
    return this.candidateService.listImportBatches();
  }

  listDecisions() {
    return this.candidateService.listDecisions();
  }

  listTestLaunches() {
    return this.candidateService.listTestLaunches();
  }

  listRiskReview() {
    return this.assessmentService.listRiskReview();
  }

  resolveRiskFlag(candidateId: string, flagId: string, actor?: AdminActor, note?: string) {
    return this.assessmentService.resolveRiskFlag(candidateId, flagId, actor, note);
  }

  activateScoringRule(id: string, actor?: AdminActor, options?: { recalculateExisting?: boolean }) {
    return this.assessmentService.activateScoringRule(id, actor, options);
  }

  recalculateCandidate(id: string, actor?: AdminActor) {
    return this.assessmentService.recalculateCandidate(id, actor);
  }

  bulkRecalculateCandidates(payload: BulkCandidateActionDto, actor?: AdminActor) {
    return this.assessmentService.bulkRecalculateCandidates(payload, actor);
  }

  manualAdjustScore(id: string, payload: ScoreManualAdjustmentDto, actor?: AdminActor) {
    return this.assessmentService.manualAdjustScore(id, payload, actor);
  }

  upsertSupplierQuote(candidateId: string, supplierId: string, payload: SupplierQuoteUpdateDto, actor?: AdminActor) {
    return this.workflowService.upsertSupplierQuote(candidateId, supplierId, payload, actor);
  }

  createDecision(candidateId: string, payload: DecisionCreateDto, actor?: AdminActor) {
    return this.workflowService.createDecision(candidateId, payload, actor);
  }

  upsertTestLaunch(candidateId: string, payload: TestLaunchUpsertDto, actor?: AdminActor) {
    return this.workflowService.upsertTestLaunch(candidateId, payload, actor);
  }

  convertToProductDraft(id: string, actor?: AdminActor) {
    return this.workflowService.convertToProductDraft(id, actor);
  }
}
