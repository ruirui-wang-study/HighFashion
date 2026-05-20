import type { Metadata } from "next";
import { CheckoutSuccessPageClient } from "./checkout-success-client";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Checkout Success",
    description: "Review your PulseGear payment status after returning from Stripe Checkout.",
    pathname: "/checkout/success",
    noIndex: true,
  });
}

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessPageClient />;
}
