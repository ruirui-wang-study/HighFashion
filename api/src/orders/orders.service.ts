import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { normalizeOrderResponse } from "./order-response";

const orderInclude = {
  items: { orderBy: { id: "asc" as const } },
  statusEvents: {
    include: { createdByAdmin: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" as const },
  },
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySession(sessionId: string) {
    const order = await this.prisma.order.findUnique({ where: { stripeCheckoutSessionId: sessionId }, include: orderInclude });
    if (!order) throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    return normalizeOrderResponse(order);
  }

  async findByOrderNo(orderNo: string) {
    const order = await this.prisma.order.findUnique({ where: { orderNo }, include: orderInclude });
    if (!order) throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    return normalizeOrderResponse(order);
  }
}
