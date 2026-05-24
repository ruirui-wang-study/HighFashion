import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { faqs } from "@/data/faq";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";
import { buildFaqStructuredData } from "@/lib/structured-data";

const zhFaqs = [
  {
    question: "配送范围包括哪些地区？",
    answer: "当前这个 MVP 主要面向美国和英国 DTC 市场。后续可以通过 Shopify 或物流服务接入真实运费与地区能力。",
  },
  {
    question: "什么时候包邮？",
    answer: "当前前台展示为满 60 美元包邮。这个门槛目前仍是站内 mock 逻辑。",
  },
  {
    question: "退货政策是什么？",
    answer: "当前站点默认文案为 30 天退货。后续可接 CMS 或 Shopify 页面输出正式政策。",
  },
  {
    question: "结账功能现在可用吗？",
    answer: "这个版本的结账链路以集成演示为主，实际支付能力依赖 Stripe 配置与 webhook 确认。",
  },
  {
    question: "如何选择尺码？",
    answer: "请结合尺码指南和商品页的测量说明选择。尺码选择始终使用按钮组，而不是下拉框。",
  },
] as const;

const copy = {
  en: {
    title: "FAQ, Shipping, and Returns",
    description: "Review PulseGear shipping, returns, fit, and checkout answers before placing an order.",
    eyebrow: "FAQ / Shipping & Returns",
    heroTitle: "Clear answers before checkout",
    heroBody: "Trust content for shipping, returns, payment safety, and fit confidence.",
  },
  zh: {
    title: "常见问题、配送与退货",
    description: "在下单前查看 PulseGear 关于配送、退货、尺码和结账的关键说明。",
    eyebrow: "FAQ / 配送与退货",
    heroTitle: "下单前先把关键问题看清楚",
    heroBody: "围绕配送、退货、支付安全和尺码选择，提供清晰可读的购买说明。",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const content = copy[locale];
  return buildPageMetadata({
    title: content.title,
    description: content.description,
    pathname: "/faq",
  });
}

export default async function FaqPage() {
  const locale = await getServerLocale();
  const content = copy[locale];
  const localizedFaqs = locale === "zh" ? [...zhFaqs] : faqs;
  return (
    <Section>
      <JsonLd data={buildFaqStructuredData(localizedFaqs)} />
      <Container>
        <SectionHeader eyebrow={content.eyebrow} title={content.heroTitle} body={content.heroBody} />
        <div className="grid gap-4 lg:grid-cols-2">{localizedFaqs.map((faq) => <div key={faq.question} className="rounded-[1.5rem] bg-white p-6"><h2 className="font-display text-3xl font-black uppercase tracking-[-0.05em]">{faq.question}</h2><p className="mt-4 leading-7 text-muted">{faq.answer}</p></div>)}</div>
      </Container>
    </Section>
  );
}
