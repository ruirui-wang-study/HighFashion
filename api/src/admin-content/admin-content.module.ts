import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { AdminContentController, StorefrontContentController } from "./admin-content.controller";
import { AdminContentService } from "./admin-content.service";

@Module({
  controllers: [AdminContentController, StorefrontContentController],
  providers: [AdminContentService, PrismaService],
  exports: [AdminContentService],
})
export class AdminContentModule {}
