import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { ok } from "../common/api-response";
import { AdminSeoService } from "./admin-seo.service";
import { AdminSeoQueryDto } from "./dto/admin-seo-query.dto";

@Controller("admin/seo")
@UseGuards(AdminAuthGuard)
export class AdminSeoController {
  constructor(private readonly adminSeoService: AdminSeoService) {}

  @Get("overview")
  @AdminRoles("CONTENT_EDITOR")
  async getOverview(@Query() query: AdminSeoQueryDto) {
    return ok(await this.adminSeoService.getOverview(query.days));
  }

  @Get("pages")
  @AdminRoles("CONTENT_EDITOR")
  async getPages(@Query() query: AdminSeoQueryDto) {
    return ok(await this.adminSeoService.getPages(query.days));
  }

  @Get("queries")
  @AdminRoles("CONTENT_EDITOR")
  async getQueries(@Query() query: AdminSeoQueryDto) {
    return ok(await this.adminSeoService.getQueries(query.days));
  }
}
