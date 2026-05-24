import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FulfillmentStatus, type Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import type { AdminOrderQueryDto } from "./dto/admin-order-query.dto";
import type { UpdateOrderNoteDto } from "./dto/update-order-note.dto";
import type { AdminActor } from "./admin-orders.types";
import { normalizeOrderResponse } from "../orders/order-response";

const orderAdminInclude = {
  items: { orderBy: { id: "asc" as const } },
  notes: {
    include: { createdByAdmin: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" as const },
  },
  statusEvents: {
    include: { createdByAdmin: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" as const },
  },
};

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminOrderQueryDto) {
    const where: Prisma.OrderWhereInput = {};

    if (query.search) {
      where.OR = [
        { orderNo: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.fulfillmentStatus) where.fulfillmentStatus = query.fulfillmentStatus;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00.000Z`) } : {}),
        ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59.999Z`) } : {}),
      };
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { orderNo: "desc" }],
    });

    return orders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      email: order.email ?? null,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      totalCents: order.totalCents,
      currency: order.currency,
      customerCountry: order.customerCountry ?? null,
      createdAt: order.createdAt.toISOString(),
      fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
    }));
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderAdminInclude,
    });
    if (!order) {
      throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    }
    return normalizeOrderResponse(order);
  }

  async addNote(id: string, actor: AdminActor, input: UpdateOrderNoteDto) {
    const note = input.note.trim();
    if (!note) {
      throw new BadRequestException({ code: "ORDER_NOTE_REQUIRED", message: "Order note is required" });
    }

    return this.prisma.$transaction(async (tx) => {
      await assertOrderExists(tx, id);

      const created = await tx.orderNote.create({
        data: {
          orderId: id,
          note,
          createdByAdminId: actor.adminId,
        },
        include: { createdByAdmin: { select: { id: true, name: true, email: true } } },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "ORDER_NOTE_ADDED",
          resource: "order",
          resourceId: id,
          details: {
            note,
            actorEmail: actor.adminEmail,
          },
        },
      });

      return {
        id: created.id,
        note: created.note,
        createdAt: created.createdAt.toISOString(),
        createdByAdmin: created.createdByAdmin,
      };
    });
  }

  async markFulfilled(id: string, actor: AdminActor) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: orderAdminInclude,
      });
      if (!existing) {
        throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
      }

      if (existing.fulfillmentStatus === FulfillmentStatus.FULFILLED) {
        return normalizeOrderResponse(existing);
      }

      const fulfilledAt = new Date();
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: "FULFILLED",
          fulfillmentStatus: FulfillmentStatus.FULFILLED,
          fulfilledAt,
        },
        include: orderAdminInclude,
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          type: "FULFILLMENT_STATUS_CHANGED",
          fromValue: existing.fulfillmentStatus,
          toValue: FulfillmentStatus.FULFILLED,
          details: {
            actorEmail: actor.adminEmail,
            fulfilledAt: fulfilledAt.toISOString(),
          },
          createdByAdminId: actor.adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "ORDER_FULFILLED",
          resource: "order",
          resourceId: id,
          details: {
            orderNo: updated.orderNo,
            fromStatus: existing.fulfillmentStatus,
            toStatus: FulfillmentStatus.FULFILLED,
            actorEmail: actor.adminEmail,
          },
        },
      });

      const refreshed = await tx.order.findUnique({
        where: { id },
        include: orderAdminInclude,
      });

      return normalizeOrderResponse(refreshed ?? updated);
    });
  }
}

async function assertOrderExists(tx: Prisma.TransactionClient, id: string) {
  const order = await tx.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) {
    throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
  }
}
