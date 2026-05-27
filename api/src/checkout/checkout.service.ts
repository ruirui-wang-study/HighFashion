import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { getAvailableStock } from "../admin-products/inventory-policy";
import { InventoryReservationService } from "../inventory/inventory-reservation.service";
import { PENDING_ORDER_TTL_MS } from "../orders/order-maintenance.service";
import { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";
import { calculateShippingCents } from "./shipping";

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: StripePaymentProvider,
    private readonly config: ConfigService,
    private readonly inventory: InventoryReservationService,
  ) {}

  async createSession(input: CreateCheckoutSessionDto) {
    const settings = await this.prisma.adminSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        storefrontUrl: this.config.get<string>("FRONTEND_URL") ?? "http://localhost:3000",
        supportEmail: "support@pulsegear.local",
        checkoutCurrency: (this.config.get<string>("STRIPE_CURRENCY") ?? "usd").toLowerCase(),
        timezone: "America/Los_Angeles",
        shippingCountries: ["US", "GB"],
        defaultFulfillmentSlaDays: 3,
        returnsPolicyUrl: "/faq",
        orderAutoFulfill: false,
        primaryPaymentProvider: "Stripe Checkout",
        stripeAutomaticPaymentMethods: true,
        paymentFailureMessage: "Retry checkout from cart if payment is not confirmed.",
        adminSessionTtlHours: 12,
        auditLoggingEnabled: true,
      },
    });

    const currency = settings.checkoutCurrency.toLowerCase();
    const allowedShippingCountries = settings.shippingCountries.length ? settings.shippingCountries : ["US", "GB"];
    if (input.country && !allowedShippingCountries.includes(input.country.toUpperCase())) {
      throw new BadRequestException({ code: "UNSUPPORTED_SHIPPING_COUNTRY", message: "Shipping country is not currently supported" });
    }

    const normalizedItems = mergeItems(input.items);
    const orderNo = `PG${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: normalizedItems.map((item) => item.variantId) }, active: true, product: { status: "ACTIVE" } },
        include: { product: true },
      });

      if (variants.length !== normalizedItems.length) {
        throw new BadRequestException({ code: "INVALID_VARIANT", message: "One or more product variants are unavailable" });
      }

      const orderItems = normalizedItems.map((item) => {
        const variant = variants.find((entry) => entry.id === item.variantId);
        if (!variant) throw new BadRequestException({ code: "INVALID_VARIANT", message: "Variant not found" });
        if (getAvailableStock(variant) < item.quantity) {
          throw new BadRequestException({
            code: "INSUFFICIENT_STOCK",
            message: `${variant.product.title} ${variant.color} ${variant.size} has insufficient stock`,
          });
        }
        return { variant, quantity: item.quantity, lineTotalCents: variant.priceCents * item.quantity };
      });

      const subtotalCents = orderItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
      const shippingCents = calculateShippingCents(subtotalCents);
      const totalCents = subtotalCents + shippingCents;

      const created = await tx.order.create({
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
        include: { items: true },
      });

      await this.inventory.reserveForOrder(
        tx,
        created.id,
        created.orderNo,
        orderItems.map(({ variant, quantity }) => ({ variantId: variant.id, quantity })),
      );

      return { created, orderItems, subtotalCents, shippingCents, totalCents };
    });

    const frontendUrl = settings.storefrontUrl || this.config.get<string>("FRONTEND_URL") || "http://localhost:3000";
    const checkoutExpiresAt = Math.floor(Date.now() / 1000) + Math.floor(PENDING_ORDER_TTL_MS / 1000);

    try {
      const session = await this.payments.createCheckoutSession({
        orderId: order.created.id,
        orderNo: order.created.orderNo,
        email: input.email,
        currency,
        shippingCountries: allowedShippingCountries,
        shippingAmount: order.shippingCents,
        lineItems: order.orderItems.map(({ variant, quantity }) => ({
          name: variant.product.title,
          description: `${variant.color} / ${variant.size}`,
          unitAmount: variant.priceCents,
          quantity,
        })),
        successUrl: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${frontendUrl}/cart`,
        checkoutExpiresAt,
      });

      await this.prisma.order.update({
        where: { id: order.created.id },
        data: { stripeCheckoutSessionId: session.id },
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
        orderNo: order.created.orderNo,
      };
    } catch (error) {
      await this.cancelPendingOrder(order.created.id, "Stripe checkout session creation failed");
      throw error;
    }
  }

  private async cancelPendingOrder(orderId: string, reason: string) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order || order.status !== "PENDING") return;

      await this.inventory.releaseForOrder(tx, order, reason);
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELED" },
      });
    });
  }
}

function mergeItems(items: CreateCheckoutSessionDto["items"]) {
  const map = new Map<string, number>();
  for (const item of items) map.set(item.variantId, (map.get(item.variantId) ?? 0) + item.quantity);
  return [...map.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}
