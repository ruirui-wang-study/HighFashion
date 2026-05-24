import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { AdminOrdersController } from "./admin-orders.controller";
import { AdminOrdersService } from "./admin-orders.service";

@Module({
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService, PrismaService],
  exports: [AdminOrdersService],
})
export class AdminOrdersModule {}
