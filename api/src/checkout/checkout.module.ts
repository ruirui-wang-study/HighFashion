import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { CheckoutController } from "./checkout.controller";
import { CheckoutService } from "./checkout.service";

@Module({
  imports: [ConfigModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService, StripePaymentProvider],
})
export class CheckoutModule {}
