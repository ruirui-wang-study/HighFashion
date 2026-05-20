import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, type Order, type OrderItem } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../common/prisma.service";
import { StripePaymentProvider } from "../payments/stripe-payment.provider";
import { getCustomerCountryFromSession, getShippingAddressFromSession } from "./stripe-webhook.mapper";

const handledEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);

type OrderWithItems = Order & { items: OrderItem[] };
@Injectable()
export class StripeWebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripePaymentProvider,
  ) {}

  async handle(payload: Buffer, signature: string | undefined) {
    if (!Buffer.isBuffer(payload)) {
      throw new BadRequestException({ code: "INVALID_WEBHOOK_BODY", message: "Stripe webhook requires raw request body" });
    }
    if (!signature) {
      throw new BadRequestException({ code: "MISSING_STRIPE_SIGNATURE", message: "Stripe-Signature header is required" });
    }

    const event = this.stripe.constructWebhookEvent(payload, signature) as Stripe.Event;
    if (!handledEvents.has(event.type)) {
      return { received: true, eventId: event.id, type: event.type, processed: false };
    }

    const result = await this.persistAndProcess(event);
    return { received: true, eventId: event.id, type: event.type, ...result };
  }

  private async persistAndProcess(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentMethodType = isSuccessEvent(event.type) ? await this.getPaymentMethodType(session) : null;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await this.findOrder(tx, session);

        await tx.paymentEvent.create({
          data: {
            stripeEventId: event.id,
            type: event.type,
            orderId: order?.id,
            payload: event as unknown as Prisma.InputJsonValue,
          },
        });

        if (!order) {
          return { processed: true, orderFound: false };
        }

        if (event.type === "checkout.session.async_payment_failed") {
          await this.markPaymentFailed(tx, order, session);
          return { processed: true, orderNo: order.orderNo, status: "PAYMENT_FAILED" };
        }

        if (event.type === "checkout.session.expired") {
          await this.markExpired(tx, order, session);
          return { processed: true, orderNo: order.orderNo, status: "EXPIRED" };
        }

        const paid = await this.markPaidAndDeductInventory(tx, order, session, paymentMethodType);
        return { processed: true, orderNo: order.orderNo, status: paid ? "PAID" : order.status };
      });
    } catch (error) {
      if (isUniqueConstraint(error, "stripeEventId")) {
        return { processed: false, duplicate: true };
      }
      throw error;
    }
  }

  private async findOrder(tx: Prisma.TransactionClient, session: Stripe.Checkout.Session) {
    if (session.id) {
      const bySession = await tx.order.findUnique({
        where: { stripeCheckoutSessionId: session.id },
        include: { items: true },
      });
      if (bySession) return bySession;
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) return null;
    return tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
  }

  private async markPaidAndDeductInventory(
    tx: Prisma.TransactionClient,
    order: OrderWithItems,
    session: Stripe.Checkout.Session,
    paymentMethodType: string | null,
  ) {
    if (order.status === "PAID") return false;

    const updated = await tx.order.updateMany({
      where: { id: order.id, status: { not: "PAID" } },
      data: {
        status: "PAID",
        email: this.getCustomerEmail(session) ?? order.email,
        stripePaymentIntentId: getPaymentIntentId(session),
        paymentMethodType,
        customerCountry: this.getCustomerCountry(session) ?? order.customerCountry,
        shippingAddress: this.getShippingAddress(session),
        billingAddress: this.getBillingAddress(session),
      },
    });
    if (updated.count === 0) return false;

    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
      await tx.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          orderId: order.id,
          type: "SALE",
          quantity: -item.quantity,
          reason: `Stripe payment succeeded for ${order.orderNo}`,
        },
      });
    }

    return true;
  }

  private async markPaymentFailed(tx: Prisma.TransactionClient, order: OrderWithItems, session: Stripe.Checkout.Session) {
    if (order.status === "PAID") return;
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAYMENT_FAILED",
        stripePaymentIntentId: getPaymentIntentId(session),
        email: this.getCustomerEmail(session) ?? order.email,
      },
    });
  }

  private async markExpired(tx: Prisma.TransactionClient, order: OrderWithItems, session: Stripe.Checkout.Session) {
    if (order.status === "PAID") return;
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "EXPIRED",
        stripePaymentIntentId: getPaymentIntentId(session),
        email: this.getCustomerEmail(session) ?? order.email,
      },
    });
  }

  private async getPaymentMethodType(session: Stripe.Checkout.Session) {
    const paymentIntentId = getPaymentIntentId(session);
    if (!paymentIntentId) return session.payment_method_types?.[0] ?? null;
    try {
      return await this.stripe.retrievePaymentIntentMethodType(paymentIntentId);
    } catch {
      return session.payment_method_types?.[0] ?? null;
    }
  }

  private getCustomerEmail(session: Stripe.Checkout.Session) {
    return session.customer_details?.email ?? session.customer_email ?? null;
  }

  private getCustomerCountry(session: Stripe.Checkout.Session) {
    return getCustomerCountryFromSession(session);
  }

  private getShippingAddress(session: Stripe.Checkout.Session) {
    return getShippingAddressFromSession(session);
  }

  private getBillingAddress(session: Stripe.Checkout.Session) {
    if (!session.customer_details) return undefined;
    return session.customer_details as unknown as Prisma.InputJsonValue;
  }
}

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  if (!session.payment_intent) return null;
  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
}

function isUniqueConstraint(error: unknown, constraint: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && String(error.meta?.target).includes(constraint);
}

function isSuccessEvent(type: string) {
  return type === "checkout.session.completed" || type === "checkout.session.async_payment_succeeded";
}
