import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

const orderInclude = { items: true };

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySession(sessionId: string) {
    const order = await this.prisma.order.findUnique({ where: { stripeCheckoutSessionId: sessionId }, include: orderInclude });
    if (!order) throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    return order;
  }

  async findByOrderNo(orderNo: string) {
    const order = await this.prisma.order.findUnique({ where: { orderNo }, include: orderInclude });
    if (!order) throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    return order;
  }
}
