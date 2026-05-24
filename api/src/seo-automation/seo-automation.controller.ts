import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { AdminRoleName } from "@prisma/client";
import type { Request } from "express";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { ok } from "../common/api-response";
import type { ProductSeoDraft } from "./seo-automation.types";
import { SeoAutomationService } from "./seo-automation.service";

type RequestWithAdmin = Request & {
  adminSession?: { sub: string; email: string; role: AdminRoleName };
};

@Controller("admin/seo")
@UseGuards(AdminAuthGuard)
export class SeoAutomationController {
  constructor(private readonly seoAutomationService: SeoAutomationService) {}

  @Get("automation/overview")
  @AdminRoles("CONTENT_EDITOR")
  async getOverview() {
    return ok(await this.seoAutomationService.getOverview());
  }

  @Post("automation/health-check/run")
  @AdminRoles("CONTENT_EDITOR")
  async runHealthCheck() {
    return ok(await this.seoAutomationService.runHealthCheck());
  }

  @Get("issues")
  @AdminRoles("CONTENT_EDITOR")
  async getIssues() {
    return ok(await this.seoAutomationService.listIssues());
  }

  @Post("issues/bulk-review")
  @AdminRoles("CONTENT_EDITOR")
  async bulkReviewIssues(@Body() body: { ids?: string[] }) {
    return ok(await this.seoAutomationService.bulkReviewIssues(body.ids ?? []));
  }

  @Post("gsc/sync")
  @AdminRoles("CONTENT_EDITOR")
  async syncGsc() {
    return ok(await this.seoAutomationService.syncSearchConsole());
  }

  @Post("ga4/sync")
  @AdminRoles("CONTENT_EDITOR")
  async syncGa4() {
    return ok(await this.seoAutomationService.syncGa4());
  }

  @Get("opportunities")
  @AdminRoles("CONTENT_EDITOR")
  async getOpportunities() {
    return ok(await this.seoAutomationService.listOpportunities());
  }

  @Post("opportunities/generate")
  @AdminRoles("CONTENT_EDITOR")
  async generateOpportunities() {
    return ok(await this.seoAutomationService.generateOpportunities());
  }

  @Post("opportunities/:id/brief")
  @AdminRoles("CONTENT_EDITOR")
  async createBrief(@Param("id") id: string) {
    return ok(await this.seoAutomationService.createContentBriefFromOpportunity(id));
  }

  @Get("recommendations")
  @AdminRoles("CONTENT_EDITOR")
  async getRecommendations() {
    return ok(await this.seoAutomationService.listRecommendations());
  }

  @Post("recommendations/generate")
  @AdminRoles("CONTENT_EDITOR")
  async generateRecommendations() {
    return ok(await this.seoAutomationService.generateRecommendations());
  }

  @Post("recommendations/:id/apply")
  @AdminRoles("CONTENT_EDITOR")
  async applyRecommendation(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.seoAutomationService.applyRecommendation(id, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Post("recommendations/:id/reject")
  @AdminRoles("CONTENT_EDITOR")
  async rejectRecommendation(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.seoAutomationService.rejectRecommendation(id, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Get("content-pipeline")
  @AdminRoles("CONTENT_EDITOR")
  async getContentPipeline() {
    return ok(await this.seoAutomationService.listContentPipeline());
  }

  @Post("content-pipeline/:id/publish")
  @AdminRoles("CONTENT_EDITOR")
  async publishBrief(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.seoAutomationService.publishContentBrief(id, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Get("internal-links")
  @AdminRoles("CONTENT_EDITOR")
  async getInternalLinks() {
    return ok(await this.seoAutomationService.listInternalLinks());
  }

  @Post("internal-links/generate")
  @AdminRoles("CONTENT_EDITOR")
  async generateInternalLinks() {
    return ok(await this.seoAutomationService.generateInternalLinkSuggestions());
  }

  @Post("internal-links/:id/apply")
  @AdminRoles("CONTENT_EDITOR")
  async applyInternalLink(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.seoAutomationService.applyInternalLinkSuggestion(id, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }

  @Get("change-log")
  @AdminRoles("CONTENT_EDITOR")
  async getChangeLog() {
    return ok(await this.seoAutomationService.listChangeLog());
  }

  @Post("products/:id/seo/generate")
  @AdminRoles("CONTENT_EDITOR")
  async generateProductSeoDraft(@Param("id") id: string) {
    return ok(await this.seoAutomationService.generateProductSeoDraft(id));
  }

  @Post("products/:id/seo/apply")
  @AdminRoles("CONTENT_EDITOR")
  async applyProductSeoDraft(@Req() request: RequestWithAdmin, @Param("id") id: string, @Body() body: ProductSeoDraft) {
    return ok(await this.seoAutomationService.applyProductSeoDraft(id, body, { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email }));
  }
}
