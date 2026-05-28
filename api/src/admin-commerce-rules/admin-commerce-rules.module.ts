import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CheckoutModule } from "../checkout/checkout.module";
import { AdminCommerceRulesController } from "./admin-commerce-rules.controller";
import { AdminCommerceRulesService } from "./admin-commerce-rules.service";

@Module({
  imports: [CheckoutModule],
  controllers: [AdminCommerceRulesController],
  providers: [AdminCommerceRulesService, PrismaService],
})
export class AdminCommerceRulesModule {}
