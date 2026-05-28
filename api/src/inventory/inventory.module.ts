import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { InventoryReconcileService } from "./inventory-reconcile.service";
import { InventoryReservationService } from "./inventory-reservation.service";

@Module({
  imports: [NotificationsModule],
  providers: [InventoryReservationService, InventoryReconcileService, PrismaService],
  exports: [InventoryReservationService],
})
export class InventoryModule {}
