import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import express from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/http-exception.filter";
import { FileLogger } from "./common/file-logger";
import { RequestMetricsInterceptor } from "./common/request-metrics.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false, logger: new FileLogger() });
  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>("FRONTEND_URL") ?? "http://localhost:3000";

  app.use(helmet());
  app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.enableCors({ origin: frontendUrl, credentials: true });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new RequestMetricsInterceptor());

  const port = config.get<number>("PORT") ?? 4000;
  await app.listen(port);
}

void bootstrap();
