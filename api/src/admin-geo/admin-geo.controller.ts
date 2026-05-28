import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { AdminRoleName } from "@prisma/client";
import type { Request } from "express";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { ok } from "../common/api-response";
import { AdminGeoService } from "./admin-geo.service";
import { CreateGeoPromptDto } from "./dto/create-geo-prompt.dto";
import { CreateGeoRecommendationDto } from "./dto/create-geo-recommendation.dto";
import { CreateGeoTestRunDto } from "./dto/create-geo-test-run.dto";

type RequestWithAdmin = Request & {
  adminSession?: { sub: string; email: string; role: AdminRoleName };
};

@Controller("admin/geo")
@UseGuards(AdminAuthGuard)
export class AdminGeoController {
  constructor(private readonly service: AdminGeoService) {}

  @Get()
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async summary() {
    return ok(await this.service.getDashboardSummary());
  }

  @Get("prompts")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async listPrompts() {
    return ok(await this.service.listPrompts());
  }

  @Post("prompts")
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async createPrompt(@Req() request: RequestWithAdmin, @Body() body: CreateGeoPromptDto) {
    return ok(await this.service.createPrompt(
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      body,
    ));
  }

  @Get("results")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async listResults() {
    return ok(await this.service.listResults());
  }

  @Post("results")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async createResult(@Req() request: RequestWithAdmin, @Body() body: CreateGeoTestRunDto) {
    return ok(await this.service.createResult(
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      body,
    ));
  }

  @Get("competitors")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async competitors() {
    return ok(await this.service.listCompetitors());
  }

  @Get("recommendations")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async listRecommendations() {
    return ok(await this.service.listRecommendations());
  }

  @Post("recommendations")
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async createRecommendation(@Req() request: RequestWithAdmin, @Body() body: CreateGeoRecommendationDto) {
    return ok(await this.service.createRecommendation(
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      body,
    ));
  }
}
