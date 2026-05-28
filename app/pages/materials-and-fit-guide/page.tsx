import type { Metadata } from "next";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Materials and Fit Guide | PulseGear",
    description: "Understand PulseGear materials, fit intent, and care standards before purchase.",
    pathname: "/pages/materials-and-fit-guide",
  });
}

export default function MaterialsAndFitGuidePage() {
  return (
    <Section>
      <Container className="max-w-4xl space-y-6">
        <SectionHeader
          eyebrow="Materials & Fit"
          title="How PulseGear products are built to fit"
          body="PulseGear products prioritize breathable support, low-bulk carry, and repeatable fit checks."
        />
        <div className="rounded-3xl bg-white p-6 text-sm leading-7 text-muted shadow-utility">
          <p>Materials: performance knit, stretch woven, quick-dry lining, and easy-care finishes.</p>
          <p className="mt-3">Fit intent: snug support without motion restriction, stable carry without bounce.</p>
          <p className="mt-3">Care: machine wash cold, air dry, avoid bleach and softener for support products.</p>
        </div>
      </Container>
    </Section>
  );
}
