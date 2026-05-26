import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { DeepSeekProductResearchProvider } from "./deepseek-product-research.provider";
import { LocalProductResearchProvider } from "./local-product-research.provider";
import { MimoProductResearchProvider } from "./mimo-product-research.provider";
import { ProductResearchController } from "./product-research.controller";
import { ProductResearchRuntimeService } from "./product-research-runtime.service";
import { ProductResearchService } from "./product-research.service";

@Module({
  controllers: [ProductResearchController],
  providers: [
    ProductResearchService,
    ProductResearchRuntimeService,
    PrismaService,
    ConfigService,
    LocalProductResearchProvider,
    DeepSeekProductResearchProvider,
    MimoProductResearchProvider,
  ],
  exports: [ProductResearchService],
})
export class ProductResearchModule {}
