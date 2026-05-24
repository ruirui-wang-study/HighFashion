import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { AdminProductsController } from "./admin-products.controller";
import { AdminProductsService } from "./admin-products.service";
import { AdminInventoryService } from "./admin-inventory.service";

@Module({
  controllers: [AdminProductsController],
  providers: [AdminProductsService, AdminInventoryService, PrismaService],
  exports: [AdminProductsService, AdminInventoryService],
})
export class AdminProductsModule {}
