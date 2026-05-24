import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./common/prisma.service";
import { AdminAuthModule } from "./admin-auth/admin-auth.module";
import { AdminAnalyticsModule } from "./admin-analytics/admin-analytics.module";
import { AdminSeoModule } from "./admin-seo/admin-seo.module";
import { AdminProductsModule } from "./admin-products/admin-products.module";
import { AdminContentModule } from "./admin-content/admin-content.module";
import { AdminMarketingModule } from "./admin-marketing/admin-marketing.module";
import { AdminOrdersModule } from "./admin-orders/admin-orders.module";
import { AdminSettingsModule } from "./admin-settings/admin-settings.module";
import { SeoAutomationModule } from "./seo-automation/seo-automation.module";
import { ProductsModule } from "./products/products.module";
import { CollectionsModule } from "./collections/collections.module";
import { CheckoutModule } from "./checkout/checkout.module";
import { OrdersModule } from "./orders/orders.module";
import { StripeWebhookModule } from "./webhooks/stripe-webhook.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../.env", ".env"] }),
    AdminAuthModule,
    AdminAnalyticsModule,
    AdminSeoModule,
    AdminProductsModule,
    AdminContentModule,
    AdminMarketingModule,
    AdminOrdersModule,
    AdminSettingsModule,
    SeoAutomationModule,
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
