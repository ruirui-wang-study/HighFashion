import { BadRequestException, Injectable } from "@nestjs/common";
import { InventoryMovementType, OrderInventoryStatus, Prisma } from "@prisma/client";
import type { Order, OrderItem } from "@prisma/client";

export type ReservationLine = {
  variantId: string;
  quantity: number;
};

type OrderWithItems = Order & { items: OrderItem[] };

@Injectable()
export class InventoryReservationService {
  async reserveForOrder(tx: Prisma.TransactionClient, orderId: string, orderNo: string, lines: ReservationLine[]) {
    const sorted = [...lines].sort((a, b) => a.variantId.localeCompare(b.variantId));

    for (const line of sorted) {
      const updated = await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "reservedStock" = "reservedStock" + ${line.quantity}
        WHERE "id" = ${line.variantId}
          AND "reservedStock" + ${line.quantity} <= "stock"
      `;
      if (Number(updated) === 0) {
        throw new BadRequestException({
          code: "INSUFFICIENT_STOCK",
          message: "One or more product variants have insufficient available stock",
        });
      }

      await tx.inventoryMovement.upsert({
        where: {
          orderId_variantId_type: {
            orderId,
            variantId: line.variantId,
            type: InventoryMovementType.RESERVATION,
          },
        },
        create: {
          orderId,
          variantId: line.variantId,
          type: InventoryMovementType.RESERVATION,
          quantity: line.quantity,
          reason: `Reserved for ${orderNo}`,
        },
        update: {},
      });
    }
  }

  async confirmForOrder(tx: Prisma.TransactionClient, order: OrderWithItems) {
    let inventoryShort = false;

    for (const item of order.items) {
      const existingSale = await tx.inventoryMovement.findUnique({
        where: {
          orderId_variantId_type: {
            orderId: order.id,
            variantId: item.variantId,
            type: InventoryMovementType.SALE,
          },
        },
      });
      if (existingSale) continue;

      const reservation = await tx.inventoryMovement.findUnique({
        where: {
          orderId_variantId_type: {
            orderId: order.id,
            variantId: item.variantId,
            type: InventoryMovementType.RESERVATION,
          },
        },
      });

      if (reservation) {
        const confirmed = await tx.$executeRaw`
          UPDATE "ProductVariant"
          SET "stock" = "stock" - ${item.quantity},
              "reservedStock" = "reservedStock" - ${item.quantity}
          WHERE "id" = ${item.variantId}
            AND "reservedStock" >= ${item.quantity}
            AND "stock" >= ${item.quantity}
        `;
        if (Number(confirmed) === 0) {
          inventoryShort = true;
          continue;
        }
      } else {
        const legacyDeduct = await tx.$executeRaw`
          UPDATE "ProductVariant"
          SET "stock" = "stock" - ${item.quantity}
          WHERE "id" = ${item.variantId}
            AND "stock" >= ${item.quantity}
        `;
        if (Number(legacyDeduct) === 0) {
          inventoryShort = true;
          continue;
        }
      }

      await tx.inventoryMovement.create({
        data: {
          orderId: order.id,
          variantId: item.variantId,
          type: InventoryMovementType.SALE,
          quantity: -item.quantity,
          reason: `Stripe payment succeeded for ${order.orderNo}`,
        },
      });
    }

    if (inventoryShort) {
      await tx.order.update({
        where: { id: order.id },
        data: { inventoryStatus: OrderInventoryStatus.SHORT },
      });
    }

    return { inventoryShort };
  }

  async releaseForOrder(tx: Prisma.TransactionClient, order: OrderWithItems, reason: string) {
    for (const item of order.items) {
      const existingRelease = await tx.inventoryMovement.findUnique({
        where: {
          orderId_variantId_type: {
            orderId: order.id,
            variantId: item.variantId,
            type: InventoryMovementType.RELEASE,
          },
        },
      });
      if (existingRelease) continue;

      const reservation = await tx.inventoryMovement.findUnique({
        where: {
          orderId_variantId_type: {
            orderId: order.id,
            variantId: item.variantId,
            type: InventoryMovementType.RESERVATION,
          },
        },
      });
      if (!reservation) continue;

      await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "reservedStock" = "reservedStock" - ${item.quantity}
        WHERE "id" = ${item.variantId}
          AND "reservedStock" >= ${item.quantity}
      `;

      await tx.inventoryMovement.create({
        data: {
          orderId: order.id,
          variantId: item.variantId,
          type: InventoryMovementType.RELEASE,
          quantity: item.quantity,
          reason,
        },
      });
    }
  }
}
