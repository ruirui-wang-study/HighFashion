import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { AdminRoleName } from "@prisma/client";
import type { Request } from "express";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { ok } from "../common/api-response";
import { AdminCommerceRulesService } from "./admin-commerce-rules.service";
import { UpsertCommerceRuleSetDto } from "./dto/upsert-commerce-ruleset.dto";
import { SimulateCommerceQuoteDto } from "./dto/simulate-commerce-quote.dto";

type RequestWithAdmin = Request & {
  adminSession?: { sub: string; email: string; role: AdminRoleName };
};

@Controller("admin/commerce/rules")
@UseGuards(AdminAuthGuard)
export class AdminCommerceRulesController {
  constructor(private readonly service: AdminCommerceRulesService) {}

  @Get("active")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async getActive() {
    return ok(await this.service.getActiveRuleSet());
  }

  @Get("sets")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async listSets() {
    return ok(await this.service.listRuleSets());
  }

  @Post("draft")
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async upsertDraft(@Req() request: RequestWithAdmin, @Body() body: UpsertCommerceRuleSetDto) {
    return ok(await this.service.upsertDraft(
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      body,
    ));
  }

  @Post("validate")
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async validateDraft(@Body() body: UpsertCommerceRuleSetDto) {
    return ok(await this.service.validateDraft(body));
  }

  @Post("sets/:id/validate")
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async validateRuleSet(@Param("id") id: string) {
    return ok(await this.service.validateRuleSet(id));
  }

  @Post("sets/:id/publish")
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async publish(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.service.publishRuleSet(
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      id,
    ));
  }

  @Post("simulate")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async simulate(@Body() body: SimulateCommerceQuoteDto) {
    return ok(await this.service.simulateQuote(body));
  }
}
