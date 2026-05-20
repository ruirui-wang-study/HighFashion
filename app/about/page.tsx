import type { Metadata } from "next";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ProductVisual } from "@/components/product-visual";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "About PulseGear",
    description: "Learn how PulseGear designs lightweight support, carry, hydration, and sweat-control essentials for repeat training days.",
    pathname: "/about",
  });
}

export default function AboutPage() {
  return (
    <Section>
      <Container className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div><SectionHeader eyebrow="About PulseGear" title="Lightweight utility for repeat training days" body="PulseGear focuses on compact support, carry, hydration, and sweat-control essentials. The assortment is intentionally narrow so the store feels like a performance brand, not a marketplace." /><div className="grid gap-3 text-muted"><p>We design around running, training, court movement, and recovery routines.</p><p>Every product page explains fit, use case, materials, and care in concise language.</p><p>The MVP uses mock data now and can later connect to Shopify Storefront API, Stripe Checkout, a CMS, and a review platform.</p></div></div>
        <ProductVisual label="Performance Utility" className="min-h-[560px]" />
      </Container>
    </Section>
  );
}
