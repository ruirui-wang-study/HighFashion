import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { InventoryModule } from "../inventory/inventory.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { OrderMaintenanceService } from "./order-maintenance.service";
import { OrderPaymentReconcileService } from "./order-payment-reconcile.service";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [InventoryModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderMaintenanceService, OrderPaymentReconcileService, PrismaService, StripePaymentProvider],
})
export class OrdersModule {}
