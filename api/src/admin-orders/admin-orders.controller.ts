import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { AdminRoleName } from "@prisma/client";
import type { Request } from "express";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { ok } from "../common/api-response";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminOrderQueryDto } from "./dto/admin-order-query.dto";
import { UpdateOrderNoteDto } from "./dto/update-order-note.dto";

type RequestWithAdmin = Request & {
  adminSession?: { sub: string; email: string; role: AdminRoleName };
};

@Controller("admin/orders")
@UseGuards(AdminAuthGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @AdminRoles("OPERATOR", "ADMIN", "SUPER_ADMIN")
  async findAll(@Query() query: AdminOrderQueryDto) {
    return ok(await this.adminOrdersService.findAll(query));
  }

  @Get(":id")
  @AdminRoles("OPERATOR", "ADMIN", "SUPER_ADMIN")
  async findById(@Param("id") id: string) {
    return ok(await this.adminOrdersService.findById(id));
  }

  @Post(":id/notes")
  @AdminRoles("OPERATOR", "ADMIN", "SUPER_ADMIN")
  async addNote(@Req() request: RequestWithAdmin, @Param("id") id: string, @Body() body: UpdateOrderNoteDto) {
    return ok(await this.adminOrdersService.addNote(
      id,
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
      body,
    ));
  }

  @Post(":id/fulfill")
  @AdminRoles("OPERATOR", "ADMIN", "SUPER_ADMIN")
  async markFulfilled(@Req() request: RequestWithAdmin, @Param("id") id: string) {
    return ok(await this.adminOrdersService.markFulfilled(
      id,
      { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
    ));
  }
}
