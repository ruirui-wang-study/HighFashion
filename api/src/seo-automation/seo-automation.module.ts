import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { SeoAutomationController } from "./seo-automation.controller";
import { SeoAutomationService } from "./seo-automation.service";

@Module({
  controllers: [SeoAutomationController],
  providers: [SeoAutomationService, PrismaService],
  exports: [SeoAutomationService],
})
export class SeoAutomationModule {}
