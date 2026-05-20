import { Prisma } from "@prisma/client";
import Stripe from "stripe";

type CheckoutSessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    name?: string | null;
    address?: Stripe.Address | null;
  } | null;
  collected_information?: {
    shipping_details?: {
      name?: string | null;
      address?: Stripe.Address | null;
    } | null;
  } | null;
};

export function getCustomerCountryFromSession(session: Stripe.Checkout.Session) {
  const shippingDetails = getShippingDetails(session);
  return shippingDetails?.address?.country ?? session.customer_details?.address?.country ?? null;
}

export function getShippingAddressFromSession(session: Stripe.Checkout.Session) {
  const shippingDetails = getShippingDetails(session);
  if (!shippingDetails) return undefined;
  return shippingDetails as unknown as Prisma.InputJsonValue;
}

function getShippingDetails(session: Stripe.Checkout.Session) {
  const typedSession = session as CheckoutSessionWithShipping;
  return typedSession.shipping_details ?? typedSession.collected_information?.shipping_details ?? null;
}
