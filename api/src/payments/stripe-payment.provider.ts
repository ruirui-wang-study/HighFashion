import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { CheckoutSessionResult, CreateCheckoutSessionInput, PaymentProvider } from "./payment-provider.interface";

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  private readonly stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    const secretKey = this.config.get<string>("STRIPE_SECRET_KEY") ?? "";
    this.stripe = new Stripe(secretKey || "sk_test_missing");
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult> {
    const secretKey = this.config.get<string>("STRIPE_SECRET_KEY") ?? "";
    if (!secretKey || secretKey === "sk_test_replace_me") {
      throw new BadRequestException({ code: "STRIPE_NOT_CONFIGURED", message: "Stripe secret key is not configured" });
    }
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      customer_email: input.email,
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: input.shippingCountries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: input.shippingAmount,
              currency: input.currency,
            },
            display_name: input.shippingAmount === 0 ? "Free shipping" : "Standard shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      line_items: input.lineItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: input.currency,
          unit_amount: item.unitAmount,
          product_data: { name: item.name, description: item.description },
        },
      })),
      metadata: {
        orderId: input.orderId,
        orderNo: input.orderNo,
      },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      ...(input.checkoutExpiresAt ? { expires_at: input.checkoutExpiresAt } : {}),
    };
    const session = await this.stripe.checkout.sessions.create(params);

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { id: session.id, url: session.url };
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>("STRIPE_WEBHOOK_SECRET") ?? "";
    if (!webhookSecret || webhookSecret === "whsec_replace_me") {
      throw new BadRequestException({ code: "STRIPE_WEBHOOK_NOT_CONFIGURED", message: "Stripe webhook secret is not configured" });
    }
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async retrievePaymentIntentMethodType(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.payment_method_types[0] ?? null;
  }
}
