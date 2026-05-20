import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { faqs } from "@/data/faq";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/seo";
import { buildFaqStructuredData } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "FAQ, Shipping, and Returns",
    description: "Review PulseGear shipping, returns, fit, and checkout answers before placing an order.",
    pathname: "/faq",
  });
}

export default function FaqPage() {
  return (
    <Section>
      <JsonLd data={buildFaqStructuredData(faqs)} />
      <Container>
        <SectionHeader eyebrow="FAQ / Shipping & Returns" title="Clear answers before checkout" body="Trust content for shipping, returns, payment safety, and fit confidence." />
        <div className="grid gap-4 lg:grid-cols-2">{faqs.map((faq) => <div key={faq.question} className="rounded-[1.5rem] bg-white p-6"><h2 className="font-display text-3xl font-black uppercase tracking-[-0.05em]">{faq.question}</h2><p className="mt-4 leading-7 text-muted">{faq.answer}</p></div>)}</div>
      </Container>
    </Section>
  );
}
