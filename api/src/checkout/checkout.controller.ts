import { Body, Controller, Post } from "@nestjs/common";
import { ok } from "../common/api-response";
import { CheckoutService } from "./checkout.service";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";

@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post("session")
  async createSession(@Body() body: CreateCheckoutSessionDto) {
    return ok(await this.checkoutService.createSession(body));
  }
}
