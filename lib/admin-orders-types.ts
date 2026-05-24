export type AdminPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type AdminFulfillmentStatus = "UNFULFILLED" | "FULFILLED";

export type AdminOrderListItem = {
  id: string;
  orderNo: string;
  email: string | null;
  status: string;
  paymentStatus: AdminPaymentStatus;
  fulfillmentStatus: AdminFulfillmentStatus;
  totalCents: number;
  currency: string;
  customerCountry: string | null;
  createdAt: string;
  fulfilledAt: string | null;
};

export type AdminOrderDetail = {
  id: string;
  orderNo: string;
  email: string | null;
  status: string;
  createdAt: string | null;
  paymentStatus: AdminPaymentStatus;
  fulfillmentStatus: AdminFulfillmentStatus;
  fulfilledAt: string | null;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  paymentMethodType: string | null;
  customerCountry: string | null;
  shippingAddress: {
    name?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
  billingAddress: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
  items: Array<{
    id: string;
    titleSnapshot: string;
    skuSnapshot: string;
    colorSnapshot: string;
    sizeSnapshot: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }>;
  notes: Array<{
    id: string;
    note: string;
    createdAt: string;
    createdByAdmin: {
      id: string;
      name: string;
      email: string;
    } | null;
  }>;
  statusEvents: Array<{
    id: string;
    type: string;
    fromValue: string | null;
    toValue: string | null;
    details: unknown;
    createdAt: string;
    createdByAdmin: {
      id: string;
      name: string;
      email: string;
    } | null;
  }>;
};
