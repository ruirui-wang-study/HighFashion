import { Controller, Get, Param } from "@nestjs/common";
import { ok } from "../common/api-response";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get("by-session/:sessionId")
  async findBySession(@Param("sessionId") sessionId: string) {
    return ok(await this.ordersService.findBySession(sessionId));
  }

  @Get(":orderNo")
  async findByOrderNo(@Param("orderNo") orderNo: string) {
    return ok(await this.ordersService.findByOrderNo(orderNo));
  }
}
