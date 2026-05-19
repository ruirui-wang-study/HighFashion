import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./common/prisma.service";
import { ProductsModule } from "./products/products.module";
import { CollectionsModule } from "./collections/collections.module";
import { CheckoutModule } from "./checkout/checkout.module";
import { OrdersModule } from "./orders/orders.module";
import { StripeWebhookModule } from "./webhooks/stripe-webhook.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../.env", ".env"] }),
    ProductsModule,
    CollectionsModule,
    CheckoutModule,
    OrdersModule,
    StripeWebhookModule,
    HealthModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
