import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { AdminSettingsController } from "./admin-settings.controller";
import { AdminSettingsService } from "./admin-settings.service";

@Module({
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService, PrismaService],
  exports: [AdminSettingsService],
})
export class AdminSettingsModule {}
