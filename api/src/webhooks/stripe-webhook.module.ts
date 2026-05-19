import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { StripeWebhookController } from "./stripe-webhook.controller";
import { StripeWebhookService } from "./stripe-webhook.service";

@Module({
  imports: [ConfigModule],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService, PrismaService, StripePaymentProvider],
})
export class StripeWebhookModule {}
