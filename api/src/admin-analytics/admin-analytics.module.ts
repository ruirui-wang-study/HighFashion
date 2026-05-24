import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { AdminAnalyticsController } from "./admin-analytics.controller";
import { AdminAnalyticsService } from "./admin-analytics.service";

@Module({
  controllers: [AdminAnalyticsController],
  providers: [AdminAnalyticsService, PrismaService],
  exports: [AdminAnalyticsService],
})
export class AdminAnalyticsModule {}
