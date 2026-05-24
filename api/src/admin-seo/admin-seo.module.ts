import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { AdminSeoController } from "./admin-seo.controller";
import { AdminSeoService } from "./admin-seo.service";
import { SearchConsoleSyncService } from "./search-console-sync.service";

@Module({
  controllers: [AdminSeoController],
  providers: [AdminSeoService, SearchConsoleSyncService, PrismaService],
  exports: [AdminSeoService, SearchConsoleSyncService],
})
export class AdminSeoModule {}
