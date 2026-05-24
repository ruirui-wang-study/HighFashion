import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import type { AdminRoleName, ContentStatus } from "@prisma/client";
import type { Request } from "express";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { ok } from "../common/api-response";
import { AdminContentService } from "./admin-content.service";
import { UpdateFaqDto } from "./dto/update-faq.dto";
import { UpsertGuideDto } from "./dto/upsert-guide.dto";

type RequestWithAdmin = Request & {
  adminSession?: { sub: string; email: string; role: AdminRoleName };
};

@Controller("admin/content")
@UseGuards(AdminAuthGuard)
export class AdminContentController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get("guides")
  @AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")
  async listGuides(@Query("status") status?: ContentStatus) {
    return ok(await this.adminContentService.listGuides(status));
  }

  @Get("guides/:id")
  @AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")
  async getGuide(@Param("id") id: string) {
    return ok(await this.adminContentService.getGuideById(id));
  }

  @Post("guides")
  @AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")
  async createGuide(@Req() request: RequestWithAdmin, @Body() body: UpsertGuideDto) {
    return ok(await this.adminContentService.createGuide(
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      body,
    ));
  }

  @Patch("guides/:id")
  @AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")
  async updateGuide(@Req() request: RequestWithAdmin, @Param("id") id: string, @Body() body: UpsertGuideDto) {
    return ok(await this.adminContentService.updateGuide(
      id,
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      body,
    ));
  }

  @Post("guides/:id/publish")
  @AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")
  async publishGuide(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.adminContentService.publishGuide(
      id,
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
    ));
  }

  @Post("guides/:id/archive")
  @AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")
  async archiveGuide(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.adminContentService.archiveGuide(
      id,
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
    ));
  }

  @Post("guides/:id/draft")
  @AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")
  async moveGuideToDraft(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.adminContentService.moveGuideToDraft(
      id,
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
    ));
  }

  @Get("faq")
  @AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")
  async getFaq() {
    return ok(await this.adminContentService.getFaq());
  }

  @Put("faq")
  @AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")
  async updateFaq(@Req() request: RequestWithAdmin, @Body() body: UpdateFaqDto) {
    return ok(await this.adminContentService.updateFaq(
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      body,
    ));
  }
}

@Controller("content")
export class StorefrontContentController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get("guides")
  async listPublishedGuides() {
    return ok(await this.adminContentService.listPublishedGuides());
  }

  @Get("guides/:slug")
  async getPublishedGuideBySlug(@Param("slug") slug: string) {
    return ok(await this.adminContentService.getPublishedGuideBySlug(slug));
  }
}
