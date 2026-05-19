import { Container, Section, SectionHeader } from "@/components/ui/section";

const faqs = [
  { q: "Where do you ship?", a: "This MVP is designed for US and UK DTC markets. Real shipping rates can be connected through Shopify or a carrier service later." },
  { q: "When is shipping free?", a: "The storefront displays free shipping over $60. This threshold is currently mock logic in the cart." },
  { q: "What is the return policy?", a: "The site message is 30-day returns. A live policy page can later pull content from a CMS or Shopify page." },
  { q: "Is checkout active?", a: "No. Checkout is disabled in this MVP and shows a payment integration coming soon message." },
  { q: "How do I choose a size?", a: "Use the Fit Guide and product-page measurement modules. Size selection is always a button group, not a dropdown." },
];

export default function FaqPage() {
  return (
    <Section>
      <Container>
        <SectionHeader eyebrow="FAQ / Shipping & Returns" title="Clear answers before checkout" body="Trust content for shipping, returns, payment safety, and fit confidence." />
        <div className="grid gap-4 lg:grid-cols-2">{faqs.map((faq) => <div key={faq.q} className="rounded-[1.5rem] bg-white p-6"><h2 className="font-display text-3xl font-black uppercase tracking-[-0.05em]">{faq.q}</h2><p className="mt-4 leading-7 text-muted">{faq.a}</p></div>)}</div>
      </Container>
    </Section>
  );
}
