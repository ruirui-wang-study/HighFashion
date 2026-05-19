import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";
import { fail } from "./api-response";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message = typeof body === "object" && body !== null && "message" in body
        ? Array.isArray((body as { message: unknown }).message)
          ? (body as { message: string[] }).message.join("; ")
          : String((body as { message: unknown }).message)
        : exception.message;
      const code = typeof body === "object" && body !== null && "code" in body ? String((body as { code: unknown }).code) : exception.name.toUpperCase();
      response.status(status).json(fail(code, message));
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(fail("INTERNAL_SERVER_ERROR", "Unexpected server error"));
  }
}
