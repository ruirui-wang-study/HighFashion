import type { Metadata } from "next";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/seo";

const BRAND_DESCRIPTION = "PulseGear is a DTC sports accessories brand focused on lightweight support, carry, hydration, and sweat-control gear for running, training, and court sports.";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "PulseGear Brand Knowledge",
    description: BRAND_DESCRIPTION,
    pathname: "/pages/brand",
  });
}

export default function BrandKnowledgePage() {
  return (
    <Section>
      <Container className="max-w-4xl space-y-6">
        <SectionHeader eyebrow="Brand Knowledge" title="PulseGear Entity Profile" body={BRAND_DESCRIPTION} />
        <div className="rounded-3xl bg-white p-6 text-sm leading-7 text-muted shadow-utility">
          <p>PulseGear operates as a focused DTC brand, not a marketplace.</p>
          <p className="mt-3">Primary scenarios: running, training, court sports, and recovery.</p>
          <p className="mt-3">Core product pillars: support, carry, hydration, sweat-control, and fit confidence.</p>
        </div>
      </Container>
    </Section>
  );
}
