import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "../src/app.module";
import { ProductResearchModule } from "../src/product-research/product-research.module";
import { SeoAutomationModule } from "../src/seo-automation/seo-automation.module";

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("PulseGear Admin Domains API")
    .setDescription("OpenAPI schema for admin product-research and seo-automation domains")
    .setVersion("1.0.0")
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [ProductResearchModule, SeoAutomationModule],
  });

  const outputDir = resolve(process.cwd(), "openapi");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = process.env.OPENAPI_OUTPUT_PATH
    ? resolve(process.env.OPENAPI_OUTPUT_PATH)
    : resolve(outputDir, "admin-domains.json");
  mkdirSync(resolve(outputPath, ".."), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(document, null, 2), "utf8");

  await app.close();
  // eslint-disable-next-line no-console
  console.log(`OpenAPI exported to ${outputPath}`);
}

void generate().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
