import { Controller, Headers, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { ok } from "../common/api-response";
import { StripeWebhookService } from "./stripe-webhook.service";

@Controller("webhooks/stripe")
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post()
  async handle(@Req() request: Request, @Headers("stripe-signature") signature?: string) {
    return ok(await this.webhookService.handle(request.body as Buffer, signature));
  }
}
