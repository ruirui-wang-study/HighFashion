import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { AdminMarketingController } from "./admin-marketing.controller";
import { AdminMerchantFeedService } from "./admin-merchant-feed.service";
import { MerchantCenterSyncService } from "./merchant-center-sync.service";

@Module({
  imports: [ConfigModule],
  controllers: [AdminMarketingController],
  providers: [AdminMerchantFeedService, MerchantCenterSyncService, PrismaService, ConfigService],
  exports: [AdminMerchantFeedService, MerchantCenterSyncService],
})
export class AdminMarketingModule {}
