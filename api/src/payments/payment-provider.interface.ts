export type CheckoutLineItem = {
  variantId: string;
  quantity: number;
};

export type CreateCheckoutSessionInput = {
  orderId: string;
  orderNo: string;
  email?: string;
  currency: string;
  shippingCountries: string[];
  shippingAmount: number;
  lineItems: Array<{
    name: string;
    description: string;
    unitAmount: number;
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  checkoutExpiresAt?: number;
};

export type CheckoutSessionResult = {
  id: string;
  url: string;
};

export interface PaymentProvider {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult>;
  constructWebhookEvent(payload: Buffer, signature: string): unknown;
  retrieveCheckoutSession(sessionId: string): Promise<unknown>;
}
