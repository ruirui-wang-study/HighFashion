import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { InventoryModule } from "../inventory/inventory.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { StripeWebhookController } from "./stripe-webhook.controller";
import { StripeWebhookService } from "./stripe-webhook.service";

@Module({
  imports: [ConfigModule, InventoryModule, NotificationsModule],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService, PrismaService, StripePaymentProvider],
})
export class StripeWebhookModule {}
