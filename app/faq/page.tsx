import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { getPublishedFaq } from "@/lib/content-api";
import { buildPageMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";
import { buildFaqStructuredData } from "@/lib/structured-data";

const copy = {
  en: {
    eyebrow: "FAQ / Shipping & Returns",
    heroTitle: "Clear answers before checkout",
    heroBody: "Trust content for shipping, returns, payment safety, and fit confidence.",
  },
  zh: {
    eyebrow: "FAQ / 配送与退货",
    heroTitle: "下单前先把关键问题看清楚",
    heroBody: "围绕配送、退货、支付安全和尺码选择，提供清晰可读的购买说明。",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const faq = await getPublishedFaq(locale);
  return buildPageMetadata({
    title: faq.seoTitle?.trim() || faq.title,
    description: faq.seoDescription?.trim() || (locale === "zh"
      ? "查看 PulseGear 关于配送、退货、尺码和结账的常见问题。"
      : "Review PulseGear shipping, returns, fit, and checkout answers before placing an order."),
    pathname: "/faq",
  });
}

export default async function FaqPage() {
  const locale = await getServerLocale();
  const content = copy[locale];
  const faq = await getPublishedFaq(locale);

  return (
    <Section>
      <JsonLd data={buildFaqStructuredData(faq.items)} />
      <Container>
        <SectionHeader eyebrow={content.eyebrow} title={content.heroTitle} body={content.heroBody} />
        <div className="grid gap-4 lg:grid-cols-2">
          {faq.items.map((item) => (
            <div key={item.question} className="rounded-[1.5rem] bg-white p-6">
              <h2 className="font-display text-3xl font-black uppercase tracking-[-0.05em]">{item.question}</h2>
              <p className="mt-4 leading-7 text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
