import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { ok } from "../common/api-response";
import { AdminMerchantFeedService } from "./admin-merchant-feed.service";

@Controller("admin/marketing")
@UseGuards(AdminAuthGuard)
export class AdminMarketingController {
  constructor(private readonly merchantFeedService: AdminMerchantFeedService) {}

  @Get("merchant-feed")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async getMerchantFeed() {
    return ok(await this.merchantFeedService.getFeedOverview());
  }

  @Get("merchant-feed/export")
  @AdminRoles("ANALYST", "ADMIN", "SUPER_ADMIN")
  async exportMerchantFeed(@Query("format") format?: "xml" | "json") {
    return ok(await this.merchantFeedService.exportFeed(format === "xml" ? "xml" : "json"));
  }
}
