import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../common/prisma.service";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminAuthGuard } from "./admin-auth.guard";
import { AdminAuthService } from "./admin-auth.service";

@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthService, PrismaService, Reflector, AdminAuthGuard],
  exports: [AdminAuthService, AdminAuthGuard],
})
export class AdminAuthModule {}
