import { Body, Controller, Post } from "@nestjs/common";
import { ok } from "../common/api-response";
import { CheckoutService } from "./checkout.service";
import { CreateCheckoutQuoteDto } from "./dto/create-checkout-quote.dto";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";

@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post("quote")
  async createQuote(@Body() body: CreateCheckoutQuoteDto) {
    return ok(await this.checkoutService.createQuote(body));
  }

  @Post("session")
  async createSession(@Body() body: CreateCheckoutSessionDto) {
    return ok(await this.checkoutService.createSession(body));
  }
}
