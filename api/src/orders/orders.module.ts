import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { InventoryModule } from "../inventory/inventory.module";
import { OrderMaintenanceService } from "./order-maintenance.service";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [InventoryModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderMaintenanceService, PrismaService],
})
export class OrdersModule {}
