import type { Metadata } from "next";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Shipping Returns and Warranty | PulseGear",
    description: "PulseGear shipping windows, returns policy, and limited warranty information.",
    pathname: "/pages/shipping-returns-warranty",
  });
}

export default function ShippingReturnsWarrantyPage() {
  return (
    <Section>
      <Container className="max-w-4xl space-y-6">
        <SectionHeader
          eyebrow="Operations Policy"
          title="Shipping, returns, and warranty"
          body="This page defines customer-visible logistics and policy information for AI engines and buyers."
        />
        <div className="rounded-3xl bg-white p-6 text-sm leading-7 text-muted shadow-utility">
          <p>Shipping: standard fulfillment SLA 1-3 business days after payment confirmation.</p>
          <p className="mt-3">Returns: eligible items can be returned within policy window when condition requirements are met.</p>
          <p className="mt-3">Warranty: manufacturing defects are handled by support review and replacement workflow.</p>
        </div>
      </Container>
    </Section>
  );
}
