type Address = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type ShippingAddress = {
  name?: string | null;
  address?: Address | null;
} | null;

type BillingAddress = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: Address | null;
} | null;

type OrderItemLike = {
  id: string;
  titleSnapshot: string;
  skuSnapshot: string;
  colorSnapshot: string;
  sizeSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type OrderLike = {
  id: string;
  orderNo: string;
  email?: string | null;
  status: string;
  createdAt?: Date;
  paymentStatus: string;
  inventoryStatus?: string;
  fulfillmentStatus: string;
  fulfilledAt?: Date | null;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentMethodType?: string | null;
  customerCountry?: string | null;
  shippingAddress?: unknown;
  billingAddress?: unknown;
  ruleSetVersion?: number | null;
  pricingSnapshot?: unknown;
  items: Array<OrderItemLike>;
};

export function normalizeOrderResponse(order: OrderLike) {
  return {
    id: order.id,
    orderNo: order.orderNo,
    email: order.email ?? null,
    status: order.status,
    createdAt: order.createdAt?.toISOString() ?? null,
    paymentStatus: order.paymentStatus,
    inventoryStatus: order.inventoryStatus ?? "OK",
    fulfillmentStatus: order.fulfillmentStatus,
    fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    discountCents: order.discountCents,
    totalCents: order.totalCents,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId ?? null,
    stripePaymentIntentId: order.stripePaymentIntentId ?? null,
    paymentMethodType: order.paymentMethodType ?? null,
    customerCountry: order.customerCountry ?? null,
    ruleSetVersion: order.ruleSetVersion ?? null,
    pricingSnapshot: order.pricingSnapshot ?? null,
    shippingAddress: normalizeShippingAddress(order.shippingAddress),
    billingAddress: normalizeBillingAddress(order.billingAddress),
    items: order.items.map((item) => ({
      id: item.id,
      titleSnapshot: item.titleSnapshot,
      skuSnapshot: item.skuSnapshot,
      colorSnapshot: item.colorSnapshot,
      sizeSnapshot: item.sizeSnapshot,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      lineTotalCents: item.lineTotalCents,
    })),
    notes: "notes" in order && Array.isArray((order as Record<string, unknown>).notes)
      ? ((order as Record<string, unknown>).notes as Array<{
          id: string;
          note: string;
          createdAt: Date;
          createdByAdmin?: { id: string; name: string; email: string } | null;
        }>).map((note) => ({
          id: note.id,
          note: note.note,
          createdAt: note.createdAt.toISOString(),
          createdByAdmin: note.createdByAdmin ?? null,
        }))
      : [],
    statusEvents: "statusEvents" in order && Array.isArray((order as Record<string, unknown>).statusEvents)
      ? ((order as Record<string, unknown>).statusEvents as Array<{
          id: string;
          type: string;
          fromValue?: string | null;
          toValue?: string | null;
          details?: unknown;
          createdAt: Date;
          createdByAdmin?: { id: string; name: string; email: string } | null;
        }>).map((event) => ({
          id: event.id,
          type: event.type,
          fromValue: event.fromValue ?? null,
          toValue: event.toValue ?? null,
          details: event.details ?? null,
          createdAt: event.createdAt.toISOString(),
          createdByAdmin: event.createdByAdmin ?? null,
        }))
      : [],
  };
}

function normalizeShippingAddress(value: unknown): ShippingAddress {
  if (!isRecord(value)) return null;
  return {
    name: getOptionalString(value.name),
    address: normalizeAddress(value.address),
  };
}

function normalizeBillingAddress(value: unknown): BillingAddress {
  if (!isRecord(value)) return null;
  return {
    name: getOptionalString(value.name),
    email: getOptionalString(value.email),
    phone: getOptionalString(value.phone),
    address: normalizeAddress(value.address),
  };
}

function normalizeAddress(value: unknown): Address | null {
  if (!isRecord(value)) return null;
  return {
    line1: getOptionalString(value.line1),
    line2: getOptionalString(value.line2),
    city: getOptionalString(value.city),
    state: getOptionalString(value.state),
    postal_code: getOptionalString(value.postal_code),
    country: getOptionalString(value.country),
  };
}

function getOptionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
