import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PrismaService } from "../common/prisma.service";
import { getAvailableStock } from "../admin-products/inventory-policy";
import { InventoryReservationService } from "../inventory/inventory-reservation.service";
import { PENDING_ORDER_TTL_MS } from "../orders/order-maintenance.service";
import { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { CreateCheckoutQuoteDto } from "./dto/create-checkout-quote.dto";
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

  async createQuote(input: CreateCheckoutQuoteDto) {
    const settings = await this.getOrCreateSettings();
    const normalizedItems = mergeItems(input.items);
    const currency = (input.currency ?? settings.checkoutCurrency).toLowerCase();
    const country = input.country?.toUpperCase();

    const allowedShippingCountries = settings.shippingCountries.length ? settings.shippingCountries : ["US", "GB"];
    if (country && !allowedShippingCountries.includes(country)) {
      throw new BadRequestException({ code: "UNSUPPORTED_SHIPPING_COUNTRY", message: "Shipping country is not currently supported" });
    }

    const orderItems = await this.resolveOrderItems(normalizedItems);
    const subtotalCents = orderItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const pricingContext = await this.computePricingContext({
      subtotalCents,
      country,
      region: input.region,
      postalCode: input.postalCode,
      currency,
    });

    const quoteId = `q_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const quoteExpiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
    const payload = this.buildQuotePayload({
      quoteId,
      quoteExpiresAt,
      items: normalizedItems,
      country,
      region: input.region,
      postalCode: input.postalCode,
      currency,
      subtotalCents,
      shippingCents: pricingContext.shippingCents,
      taxCents: pricingContext.taxCents,
      totalCents: subtotalCents + pricingContext.shippingCents + pricingContext.taxCents,
      ruleSetVersion: pricingContext.ruleSetVersion,
    });

    return {
      quoteId,
      quoteExpiresAt,
      quoteSignature: this.signQuotePayload(payload),
      pricing: {
        currency,
        subtotalCents,
        shippingCents: pricingContext.shippingCents,
        taxCents: pricingContext.taxCents,
        discountCents: 0,
        totalCents: subtotalCents + pricingContext.shippingCents + pricingContext.taxCents,
      },
      ruleContext: {
        ruleSetVersion: pricingContext.ruleSetVersion,
        shippingRuleId: pricingContext.shippingRuleId,
        taxRuleId: pricingContext.taxRuleId,
        paymentRuleIds: pricingContext.paymentRuleIds,
      },
      availablePaymentMethods: pricingContext.availablePaymentMethods,
    };
  }

  async createSession(input: CreateCheckoutSessionDto) {
    const settings = await this.getOrCreateSettings();

    const currency = settings.checkoutCurrency.toLowerCase();
    const allowedShippingCountries = settings.shippingCountries.length ? settings.shippingCountries : ["US", "GB"];
    const country = input.country?.toUpperCase();
    if (country && !allowedShippingCountries.includes(country)) {
      throw new BadRequestException({ code: "UNSUPPORTED_SHIPPING_COUNTRY", message: "Shipping country is not currently supported" });
    }

    const normalizedItems = mergeItems(input.items);
    const orderItems = await this.resolveOrderItems(normalizedItems);
    const subtotalCents = orderItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const pricingContext = await this.computePricingContext({
      subtotalCents,
      country,
      region: input.region,
      postalCode: input.postalCode,
      currency,
    });
    const totalCents = subtotalCents + pricingContext.shippingCents + pricingContext.taxCents;

    if (input.quoteId && input.quoteExpiresAt && input.quoteSignature) {
      if (Date.parse(input.quoteExpiresAt) < Date.now()) {
        throw new BadRequestException({ code: "QUOTE_EXPIRED", message: "Checkout quote has expired" });
      }
      const payload = this.buildQuotePayload({
        quoteId: input.quoteId,
        quoteExpiresAt: input.quoteExpiresAt,
        items: normalizedItems,
        country,
        region: input.region,
        postalCode: input.postalCode,
        currency,
        subtotalCents,
        shippingCents: pricingContext.shippingCents,
        taxCents: pricingContext.taxCents,
        totalCents,
        ruleSetVersion: pricingContext.ruleSetVersion,
      });
      this.assertQuoteSignature(payload, input.quoteSignature);
    }

    const orderNo = `PG${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNo,
          email: input.email,
          status: "PENDING",
          currency,
          subtotalCents,
          shippingCents: pricingContext.shippingCents,
          discountCents: 0,
          totalCents,
          customerCountry: country,
          ruleSetVersion: pricingContext.ruleSetVersion,
          pricingSnapshot: {
            currency,
            subtotalCents,
            shippingCents: pricingContext.shippingCents,
            taxCents: pricingContext.taxCents,
            discountCents: 0,
            totalCents,
            ruleSetVersion: pricingContext.ruleSetVersion,
            taxRuleId: pricingContext.taxRuleId,
            shippingRuleId: pricingContext.shippingRuleId,
            paymentRuleIds: pricingContext.paymentRuleIds,
          },
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

      return { created, orderItems, subtotalCents, shippingCents: pricingContext.shippingCents, totalCents };
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

  private async getOrCreateSettings() {
    return this.prisma.adminSettings.upsert({
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
  }

  private async resolveOrderItems(items: Array<{ variantId: string; quantity: number }>) {
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: items.map((item) => item.variantId) }, active: true, product: { status: "ACTIVE" } },
      include: { product: true },
    });

    if (variants.length !== items.length) {
      throw new BadRequestException({ code: "INVALID_VARIANT", message: "One or more product variants are unavailable" });
    }

    return items.map((item) => {
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
  }

  private async computePricingContext(input: {
    subtotalCents: number;
    country?: string;
    region?: string;
    postalCode?: string;
    currency: string;
  }) {
    const activeRuleSet = await this.prisma.commerceRuleSet.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: new Date() } }],
        AND: [{ OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }] }],
      },
      orderBy: { version: "desc" },
    });

    if (!activeRuleSet) {
      return {
        ruleSetVersion: null as number | null,
        shippingRuleId: null as string | null,
        taxRuleId: null as string | null,
        paymentRuleIds: [] as string[],
        shippingCents: calculateShippingCents(input.subtotalCents),
        taxCents: 0,
        availablePaymentMethods: ["CARD"],
      };
    }

    const [shippingRule, taxRule, paymentRules] = await Promise.all([
      this.prisma.shippingRule.findFirst({
        where: {
          ruleSetId: activeRuleSet.id,
          enabled: true,
          currency: input.currency,
          countryCode: input.country ?? "US",
          OR: [{ regionCode: null }, { regionCode: input.region ?? null }],
        },
        orderBy: { priority: "asc" },
      }),
      this.prisma.taxRule.findFirst({
        where: {
          ruleSetId: activeRuleSet.id,
          enabled: true,
          currency: input.currency,
          countryCode: input.country ?? "US",
          OR: [{ regionCode: null }, { regionCode: input.region ?? null }],
        },
        orderBy: { priority: "asc" },
      }),
      this.prisma.paymentMethodRule.findMany({
        where: {
          ruleSetId: activeRuleSet.id,
          enabled: true,
          currency: input.currency,
          countryCode: input.country ?? "US",
          OR: [{ minAmountMinor: null }, { minAmountMinor: { lte: input.subtotalCents } }],
          AND: [{ OR: [{ maxAmountMinor: null }, { maxAmountMinor: { gte: input.subtotalCents } }] }],
        },
        orderBy: { priority: "asc" },
      }),
    ]);

    const shippingCents = shippingRule
      ? shippingRule.feeMode === "FREE_OVER_THRESHOLD"
        ? input.subtotalCents >= (shippingRule.freeOverMinor ?? Number.MAX_SAFE_INTEGER)
          ? 0
          : shippingRule.flatFeeMinor ?? calculateShippingCents(input.subtotalCents)
        : shippingRule.flatFeeMinor ?? calculateShippingCents(input.subtotalCents)
      : calculateShippingCents(input.subtotalCents);

    const taxCents = taxRule ? Math.round((input.subtotalCents * taxRule.rateBps) / 10_000) : 0;

    return {
      ruleSetVersion: activeRuleSet.version,
      shippingRuleId: shippingRule?.id ?? null,
      taxRuleId: taxRule?.id ?? null,
      paymentRuleIds: paymentRules.map((rule) => rule.id),
      shippingCents,
      taxCents,
      availablePaymentMethods: paymentRules.length ? paymentRules.map((rule) => rule.method) : ["CARD"],
    };
  }

  private buildQuotePayload(input: {
    quoteId: string;
    quoteExpiresAt: string;
    items: Array<{ variantId: string; quantity: number }>;
    country?: string;
    region?: string;
    postalCode?: string;
    currency: string;
    subtotalCents: number;
    shippingCents: number;
    taxCents: number;
    totalCents: number;
    ruleSetVersion: number | null;
  }) {
    return JSON.stringify({
      quoteId: input.quoteId,
      quoteExpiresAt: input.quoteExpiresAt,
      items: input.items,
      country: input.country ?? null,
      region: input.region ?? null,
      postalCode: input.postalCode ?? null,
      currency: input.currency,
      subtotalCents: input.subtotalCents,
      shippingCents: input.shippingCents,
      taxCents: input.taxCents,
      totalCents: input.totalCents,
      ruleSetVersion: input.ruleSetVersion,
    });
  }

  private signQuotePayload(payload: string) {
    const secret = this.config.get<string>("CHECKOUT_QUOTE_SECRET") ?? this.config.get<string>("APP_SECRET") ?? "dev-checkout-secret";
    return createHmac("sha256", secret).update(payload).digest("hex");
  }

  private assertQuoteSignature(payload: string, provided: string) {
    const expected = this.signQuotePayload(payload);
    const expectedBuffer = Buffer.from(expected, "utf8");
    const providedBuffer = Buffer.from(provided, "utf8");
    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      throw new BadRequestException({ code: "QUOTE_SIGNATURE_INVALID", message: "Checkout quote signature is invalid" });
    }
  }
}

function mergeItems(items: CreateCheckoutSessionDto["items"]) {
  const map = new Map<string, number>();
  for (const item of items) map.set(item.variantId, (map.get(item.variantId) ?? 0) + item.quantity);
  return [...map.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}
