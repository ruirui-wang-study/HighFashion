import { Body, Controller, Get, Put, Query, Req, UseGuards } from "@nestjs/common";
import type { AdminRoleName } from "@prisma/client";
import type { Request } from "express";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { ok } from "../common/api-response";
import { AdminSettingsService } from "./admin-settings.service";
import { UpdateCopyConfigDto } from "./dto/update-copy-config.dto";
import { UpdateAdminSettingsDto } from "./dto/update-admin-settings.dto";

type RequestWithAdmin = Request & {
  adminSession?: { sub: string; email: string; role: AdminRoleName };
};

@Controller("admin/settings")
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async getSettings() {
    return ok(await this.adminSettingsService.getSettings());
  }

  @Get("public")
  async getPublicSettings() {
    return ok(await this.adminSettingsService.getPublicStorefrontSettings());
  }

  @Get("copy")
  @UseGuards(AdminAuthGuard)
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async getCopyConfig() {
    return ok(await this.adminSettingsService.getCopyConfig());
  }

  @Get("public-copy")
  async getPublicSiteCopySnapshot(@Query("locale") locale?: string) {
    return ok(await this.adminSettingsService.getPublicSiteCopySnapshot(locale === "zh" ? "zh" : "en"));
  }

  @Put()
  @UseGuards(AdminAuthGuard)
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async updateSettings(@Req() request: RequestWithAdmin, @Body() body: UpdateAdminSettingsDto) {
    return ok(await this.adminSettingsService.updateSettings(
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      body,
    ));
  }

  @Put("copy")
  @UseGuards(AdminAuthGuard)
  @AdminRoles("ADMIN", "SUPER_ADMIN")
  async updateCopyConfig(@Req() request: RequestWithAdmin, @Body() body: UpdateCopyConfigDto) {
    return ok(await this.adminSettingsService.updateCopyConfig(
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      {
        siteSettings: body.siteSettings.map((item) => ({ key: item.key, value: item.value as string | number | boolean | null })),
        uiCopy: {
          en: body.uiCopy.en.map((item) => ({ key: item.key, value: item.value as string | number | boolean | null })),
          zh: body.uiCopy.zh.map((item) => ({ key: item.key, value: item.value as string | number | boolean | null })),
        },
        contentTemplates: body.contentTemplates.map((item) => ({ key: item.key, name: item.name, value: item.value, status: item.status })),
        seoRules: body.seoRules.map((item) => ({ key: item.key, value: item.value as string | number | boolean | null })),
      },
    ));
  }
}
