import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ok } from "../common/api-response";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { AdminAnalyticsQueryDto } from "./dto/admin-analytics-query.dto";
import { AdminAnalyticsService } from "./admin-analytics.service";

@Controller("admin/analytics")
@UseGuards(AdminAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get("dashboard")
  @AdminRoles("ANALYST")
  async getDashboard(@Query() query: AdminAnalyticsQueryDto) {
    return ok(await this.adminAnalyticsService.getDashboardAnalytics(query.days));
  }

  @Get("sales")
  @AdminRoles("ANALYST")
  async getSales(@Query() query: AdminAnalyticsQueryDto) {
    return ok(await this.adminAnalyticsService.getSalesAnalytics(query.days));
  }

  @Get("products")
  @AdminRoles("ANALYST")
  async getProducts(@Query() query: AdminAnalyticsQueryDto) {
    return ok(await this.adminAnalyticsService.getProductAnalytics(query.days));
  }

  @Get("funnel")
  @AdminRoles("ANALYST")
  async getFunnel(@Query() query: AdminAnalyticsQueryDto) {
    return ok(await this.adminAnalyticsService.getFunnelAnalytics(query.days));
  }
}
