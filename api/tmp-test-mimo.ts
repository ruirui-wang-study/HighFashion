import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app.module";
import { ProductResearchRuntimeService } from "./src/product-research/product-research-runtime.service";
import { PrismaService } from "./src/common/prisma.service";
import { ConfigService } from "@nestjs/config";
import { resolveProductResearchAiConfig } from "./src/product-research/product-research-ai-config";

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  try {
    const runtime = app.get(ProductResearchRuntimeService);
    const prisma = app.get(PrismaService);
    const config = app.get(ConfigService);
    const ai = await resolveProductResearchAiConfig(prisma, config);
    const items = await runtime.generateCandidates({
      brandDirection: "performance utility for runners and court athletes",
      targetMarket: "US",
      excludedCategories: ["electronics", "supplements"],
      count: 3,
    });

    console.log(JSON.stringify({
      ai,
      sampleCount: items.length,
      sampleNames: items.map((item) => item.productName),
      firstSource: items[0]?.source ?? null,
      firstAiPayload: items[0]?.aiDraftPayload ?? null,
    }, null, 2));
  } finally {
    await app.close();
  }
}

void main();
