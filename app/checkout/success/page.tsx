import type { Metadata } from "next";
import { CheckoutSuccessPageClient } from "./checkout-success-client";
import { buildPageMetadata } from "@/lib/seo";
import { getPublicStorefrontSettings } from "@/lib/storefront-settings";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Checkout Success",
    description: "Review your PulseGear payment status after returning from Stripe Checkout.",
    pathname: "/checkout/success",
    noIndex: true,
  });
}

export default async function CheckoutSuccessPage() {
  const settings = await getPublicStorefrontSettings();
  return (
    <CheckoutSuccessPageClient
      supportEmail={settings.supportEmail}
      returnsPolicyUrl={settings.returnsPolicyUrl}
      paymentFailureMessage={settings.paymentFailureMessage}
    />
  );
}
