import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { Observable, tap } from "rxjs";

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HttpMetrics");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { requestId?: string }>();
    const response = http.getResponse<Response>();
    const incomingRequestId = request.headers["x-request-id"];
    const requestId = typeof incomingRequestId === "string" && incomingRequestId.trim() ? incomingRequestId : randomUUID();
    request.requestId = requestId;
    response.setHeader("x-request-id", requestId);
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startedAt;
          this.logger.log(
            JSON.stringify({
              requestId,
              method: request.method,
              path: request.originalUrl || request.url,
              statusCode: response.statusCode,
              durationMs,
            }),
          );
        },
        error: (error) => {
          const durationMs = Date.now() - startedAt;
          this.logger.error(
            JSON.stringify({
              requestId,
              method: request.method,
              path: request.originalUrl || request.url,
              statusCode: response.statusCode,
              durationMs,
              error: error instanceof Error ? error.message : String(error),
            }),
          );
        },
      }),
    );
  }
}
