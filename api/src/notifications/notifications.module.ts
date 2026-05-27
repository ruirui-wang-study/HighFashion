import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { FeishuClient } from "./feishu/feishu.client";
import { OrderInventoryAlertService } from "./order-inventory-alert.service";

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, FeishuClient, OrderInventoryAlertService],
  exports: [OrderInventoryAlertService],
})
export class NotificationsModule {}
