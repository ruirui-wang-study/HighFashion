import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { FeishuClient } from "./feishu/feishu.client";
import { NotificationDispatcherService } from "./notification-dispatcher.service";
import { NotificationOutboxService } from "./notification-outbox.service";
import { OrderInventoryAlertService } from "./order-inventory-alert.service";

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, FeishuClient, NotificationOutboxService, NotificationDispatcherService, OrderInventoryAlertService],
  exports: [OrderInventoryAlertService],
})
export class NotificationsModule {}
