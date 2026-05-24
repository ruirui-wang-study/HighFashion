import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { AdminRoleName } from "@prisma/client";
import { ok } from "../common/api-response";
import { AdminAuthGuard } from "../admin-auth/admin-auth.guard";
import { AdminRoles } from "../admin-auth/admin-roles.decorator";
import { AdminProductsService } from "./admin-products.service";
import { AdjustInventoryDto } from "./dto/adjust-inventory.dto";
import { AdminInventoryQueryDto } from "./dto/admin-inventory-query.dto";
import { AdminProductQueryDto } from "./dto/admin-product-query.dto";
import { UpsertAdminProductDto } from "./dto/upsert-admin-product.dto";
import { AdminInventoryService } from "./admin-inventory.service";

type RequestWithAdmin = Request & {
  adminSession?: { sub: string; email: string; role: AdminRoleName };
};

@Controller("admin")
@UseGuards(AdminAuthGuard)
export class AdminProductsController {
  constructor(
    private readonly adminProductsService: AdminProductsService,
    private readonly adminInventoryService: AdminInventoryService,
  ) {}

  @Get("products")
  @AdminRoles("OPERATOR", "CONTENT_EDITOR")
  async findAllProducts(@Query() query: AdminProductQueryDto) {
    return ok(await this.adminProductsService.findAll(query));
  }

  @Get("products/:id")
  @AdminRoles("OPERATOR", "CONTENT_EDITOR")
  async findProduct(@Param("id") id: string) {
    return ok(await this.adminProductsService.findById(id));
  }

  @Post("products")
  @AdminRoles("OPERATOR")
  async createProduct(@Req() request: RequestWithAdmin, @Body() body: UpsertAdminProductDto) {
    return ok(
      await this.adminProductsService.create(
        { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
        body,
      ),
    );
  }

  @Patch("products/:id")
  @AdminRoles("OPERATOR")
  async updateProduct(@Req() request: RequestWithAdmin, @Param("id") id: string, @Body() body: UpsertAdminProductDto) {
    return ok(
      await this.adminProductsService.update(
        id,
        { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
        body,
      ),
    );
  }

  @Get("inventory")
  @AdminRoles("OPERATOR")
  async listInventory(@Query() query: AdminInventoryQueryDto) {
    return ok(await this.adminInventoryService.list(query));
  }

  @Post("inventory/adjustments")
  @AdminRoles("OPERATOR")
  async adjustInventory(@Req() request: RequestWithAdmin, @Body() body: AdjustInventoryDto) {
    return ok(
      await this.adminInventoryService.adjustStock(
        { adminId: request.adminSession!.sub, adminEmail: request.adminSession!.email },
        body,
      ),
    );
  }
}
