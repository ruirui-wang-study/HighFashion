import type { Metadata } from "next";
import { CartPageClient } from "./cart-page-client";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Cart",
    description: "Review your PulseGear cart before secure Stripe checkout.",
    pathname: "/cart",
    noIndex: true,
  });
}

export default function CartPage() {
  return <CartPageClient />;
}
