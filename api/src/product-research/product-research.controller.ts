import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AlibabaLinkImportCommitDto, AlibabaLinkImportPreviewDto } from "./dto/alibaba-import.dto";
import type { AdminRoleName } from "@prisma/client";
import type { Request } from "express";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { ok } from "../common/api-response";
import { AiImportCommitDto, AiImportPreviewDto } from "./dto/ai-import.dto";
import { BulkCandidateActionDto } from "./dto/bulk-candidate-action.dto";
import { CandidateQueryDto } from "./dto/candidate-query.dto";
import { CsvImportCommitDto, CsvImportPreviewDto } from "./dto/csv-import.dto";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { CreateScoringRuleDto } from "./dto/create-scoring-rule.dto";
import { DecisionCreateDto } from "./dto/decision-create.dto";
import { ScoreManualAdjustmentDto } from "./dto/score-manual-adjustment.dto";
import { SupplierQuoteImportCommitDto, SupplierQuoteImportPreviewDto } from "./dto/supplier-quote-import.dto";
import { SupplierQuoteUpdateDto } from "./dto/supplier-quote-update.dto";
import { TestLaunchUpsertDto } from "./dto/test-launch-upsert.dto";
import { ProductResearchService } from "./product-research.service";

type RequestWithAdmin = Request & {
  adminSession?: { sub: string; email: string; role: AdminRoleName };
};

@Controller("admin/product-research")
@UseGuards(AdminAuthGuard)
export class ProductResearchController {
  constructor(private readonly productResearchService: ProductResearchService) {}

  @Get("dashboard")
  @AdminRoles("ANALYST")
  async getDashboard() {
    return ok(await this.productResearchService.getDashboard());
  }

  @Get("candidates")
  @AdminRoles("ANALYST")
  async listCandidates(@Query() query: CandidateQueryDto) {
    return ok(await this.productResearchService.listCandidates(query));
  }

  @Post("candidates")
  @AdminRoles("OPERATOR")
  async createCandidate(@Req() request: RequestWithAdmin, @Body() body: CreateCandidateDto) {
    return ok(await this.productResearchService.createCandidate(body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Get("candidates/:id")
  @AdminRoles("ANALYST")
  async getCandidateDetail(@Param("id") id: string) {
    return ok(await this.productResearchService.getCandidateDetail(id));
  }

  @Post("candidates/:id/recalculate")
  @AdminRoles("ANALYST")
  async recalculateCandidate(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.productResearchService.recalculateCandidate(id, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Post("candidates/bulk-recalculate")
  @AdminRoles("ANALYST")
  async bulkRecalculateCandidates(@Req() request: RequestWithAdmin, @Body() body: BulkCandidateActionDto) {
    return ok(await this.productResearchService.bulkRecalculateCandidates(body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Post("candidates/:id/score-adjust")
  @AdminRoles("ANALYST")
  async manualAdjustScore(@Req() request: RequestWithAdmin, @Param("id") id: string, @Body() body: ScoreManualAdjustmentDto) {
    return ok(await this.productResearchService.manualAdjustScore(id, body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Patch("candidates/:id/suppliers/:supplierId")
  @AdminRoles("OPERATOR")
  async updateSupplierQuote(@Param("id") id: string, @Param("supplierId") supplierId: string, @Body() body: SupplierQuoteUpdateDto) {
    return ok(await this.productResearchService.upsertSupplierQuote(id, supplierId, body));
  }

  @Post("candidates/:id/decisions")
  @AdminRoles("ADMIN")
  async createDecision(@Req() request: RequestWithAdmin, @Param("id") id: string, @Body() body: DecisionCreateDto) {
    return ok(await this.productResearchService.createDecision(id, body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Post("candidates/:id/test-launches")
  @AdminRoles("OPERATOR")
  async upsertTestLaunch(@Param("id") id: string, @Body() body: TestLaunchUpsertDto) {
    return ok(await this.productResearchService.upsertTestLaunch(id, body));
  }

  @Post("candidates/:id/convert-to-product")
  @AdminRoles("ADMIN")
  async convertToProductDraft(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.productResearchService.convertToProductDraft(id, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Post("import/ai/preview")
  @AdminRoles("OPERATOR")
  async previewAiImport(@Body() body: AiImportPreviewDto) {
    return ok(await this.productResearchService.previewAiImport(body));
  }

  @Post("import/ai/commit")
  @AdminRoles("OPERATOR")
  async commitAiImport(@Req() request: RequestWithAdmin, @Body() body: AiImportCommitDto) {
    return ok(await this.productResearchService.commitAiImport(body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Post("import/csv/preview")
  @AdminRoles("OPERATOR")
  async previewCsvImport(@Body() body: CsvImportPreviewDto) {
    return ok(await this.productResearchService.previewCsvImport(body));
  }

  @Post("import/csv/commit")
  @AdminRoles("OPERATOR")
  async commitCsvImport(@Req() request: RequestWithAdmin, @Body() body: CsvImportCommitDto) {
    return ok(await this.productResearchService.commitCsvImport(body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Post("import/supplier-quotes/preview")
  @AdminRoles("OPERATOR")
  async previewSupplierQuoteImport(@Body() body: SupplierQuoteImportPreviewDto) {
    return ok(await this.productResearchService.previewSupplierQuoteImport(body));
  }

  @Post("import/supplier-quotes/commit")
  @AdminRoles("OPERATOR")
  async commitSupplierQuoteImport(@Req() request: RequestWithAdmin, @Body() body: SupplierQuoteImportCommitDto) {
    return ok(await this.productResearchService.commitSupplierQuoteImport(body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Post("import/alibaba-links/preview")
  @AdminRoles("OPERATOR")
  async previewAlibabaLinks(@Body() body: AlibabaLinkImportPreviewDto) {
    return ok(await this.productResearchService.previewAlibabaLinks(body));
  }

  @Post("import/alibaba-links/commit")
  @AdminRoles("OPERATOR")
  async commitAlibabaLinks(@Req() request: RequestWithAdmin, @Body() body: AlibabaLinkImportCommitDto) {
    return ok(await this.productResearchService.commitAlibabaLinks(body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Get("risk-review")
  @AdminRoles("VIEWER")
  async listRiskReview() {
    return ok(await this.productResearchService.listRiskReview());
  }

  @Get("suppliers")
  @AdminRoles("ANALYST")
  async listSuppliers() {
    return ok(await this.productResearchService.listSuppliers());
  }

  @Get("import/batches")
  @AdminRoles("VIEWER")
  async listImportBatches() {
    return ok(await this.productResearchService.listImportBatches());
  }

  @Get("decisions")
  @AdminRoles("VIEWER")
  async listDecisions() {
    return ok(await this.productResearchService.listDecisions());
  }

  @Get("test-launches")
  @AdminRoles("VIEWER")
  async listTestLaunches() {
    return ok(await this.productResearchService.listTestLaunches());
  }

  @Get("scoring-rules")
  @AdminRoles("ANALYST")
  async listScoringRules() {
    return ok(await this.productResearchService.listScoringRules());
  }

  @Post("scoring-rules")
  @AdminRoles("ADMIN")
  async createScoringRule(@Req() request: RequestWithAdmin, @Body() body: CreateScoringRuleDto) {
    return ok(await this.productResearchService.createScoringRule(body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Post("scoring-rules/:id/activate")
  @AdminRoles("ADMIN")
  async activateScoringRule(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.productResearchService.activateScoringRule(id, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }
}
