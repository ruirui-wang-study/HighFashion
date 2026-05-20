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
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  stripeCheckoutSessionId?: string | null;
  paymentMethodType?: string | null;
  customerCountry?: string | null;
  shippingAddress?: unknown;
  billingAddress?: unknown;
  items: Array<OrderItemLike>;
};

export function normalizeOrderResponse(order: OrderLike) {
  return {
    id: order.id,
    orderNo: order.orderNo,
    email: order.email ?? null,
    status: order.status,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    discountCents: order.discountCents,
    totalCents: order.totalCents,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId ?? null,
    paymentMethodType: order.paymentMethodType ?? null,
    customerCountry: order.customerCountry ?? null,
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
