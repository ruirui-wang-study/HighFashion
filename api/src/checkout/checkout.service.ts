import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { calculateShippingCents } from "./shipping";

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: StripePaymentProvider,
    private readonly config: ConfigService,
  ) {}

  async createSession(input: CreateCheckoutSessionDto) {
    const currency = (input.currency ?? this.config.get<string>("STRIPE_CURRENCY") ?? "usd").toLowerCase();
    const normalizedItems = mergeItems(input.items);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: normalizedItems.map((item) => item.variantId) }, active: true, product: { status: "ACTIVE" } },
      include: { product: true },
    });

    if (variants.length !== normalizedItems.length) {
      throw new BadRequestException({ code: "INVALID_VARIANT", message: "One or more product variants are unavailable" });
    }

    const orderItems = normalizedItems.map((item) => {
      const variant = variants.find((entry) => entry.id === item.variantId);
      if (!variant) throw new BadRequestException({ code: "INVALID_VARIANT", message: "Variant not found" });
      if (variant.stock < item.quantity) {
        throw new BadRequestException({ code: "INSUFFICIENT_STOCK", message: `${variant.product.title} ${variant.color} ${variant.size} has insufficient stock` });
      }
      return { variant, quantity: item.quantity, lineTotalCents: variant.priceCents * item.quantity };
    });

    const subtotalCents = orderItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const shippingCents = calculateShippingCents(subtotalCents);
    const totalCents = subtotalCents + shippingCents;
    const orderNo = `PG${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        orderNo,
        email: input.email,
        status: "PENDING",
        currency,
        subtotalCents,
        shippingCents,
        discountCents: 0,
        totalCents,
        customerCountry: input.country,
        items: {
          create: orderItems.map(({ variant, quantity, lineTotalCents }) => ({
            productId: variant.productId,
            variantId: variant.id,
            titleSnapshot: variant.product.title,
            skuSnapshot: variant.sku,
            colorSnapshot: variant.color,
            sizeSnapshot: variant.size,
            quantity,
            unitPriceCents: variant.priceCents,
            lineTotalCents,
          })),
        },
      },
    });

    const frontendUrl = this.config.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
    const session = await this.payments.createCheckoutSession({
      orderId: order.id,
      orderNo: order.orderNo,
      email: input.email,
      currency,
      shippingAmount: shippingCents,
      lineItems: orderItems.map(({ variant, quantity }) => ({
        name: variant.product.title,
        description: `${variant.color} / ${variant.size}`,
        unitAmount: variant.priceCents,
        quantity,
      })),
      successUrl: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/cart`,
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
      orderNo: order.orderNo,
    };
  }
}

function mergeItems(items: CreateCheckoutSessionDto["items"]) {
  const map = new Map<string, number>();
  for (const item of items) map.set(item.variantId, (map.get(item.variantId) ?? 0) + item.quantity);
  return [...map.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}
