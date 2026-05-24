import type { Metadata } from "next";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ProductVisual } from "@/components/product-visual";
import { buildPageMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";

const copy = {
  en: {
    title: "About PulseGear",
    description: "Learn how PulseGear designs lightweight support, carry, hydration, and sweat-control essentials for repeat training days.",
    eyebrow: "About PulseGear",
    heroTitle: "Lightweight utility for repeat training days",
    heroBody:
      "PulseGear focuses on compact support, carry, hydration, and sweat-control essentials. The assortment is intentionally narrow so the store feels like a performance brand, not a marketplace.",
    paragraphs: [
      "We design around running, training, court movement, and recovery routines.",
      "Every product page explains fit, use case, materials, and care in concise language.",
      "The MVP uses mock data now and can later connect to Shopify Storefront API, Stripe Checkout, a CMS, and a review platform.",
    ],
    visualLabel: "Performance Utility",
  },
  zh: {
    title: "关于 PulseGear",
    description: "了解 PulseGear 如何为高频训练场景打造轻量支撑、收纳、补水与吸汗装备。",
    eyebrow: "关于 PulseGear",
    heroTitle: "为高频训练打造的轻量机能装备",
    heroBody:
      "PulseGear 聚焦紧凑型支撑、收纳、补水和吸汗类装备。产品线刻意保持克制，让整站更像专业运动品牌，而不是泛化 marketplace。",
    paragraphs: [
      "我们的设计始终围绕跑步、训练、球场移动与恢复场景展开。",
      "每个商品页都会用简洁语言说明尺码、使用场景、材料与护理方式。",
      "当前 MVP 仍以 mock 数据为主，后续可以继续接入 Shopify Storefront API、Stripe Checkout、CMS 和评价系统。",
    ],
    visualLabel: "性能机能",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const content = copy[locale];
  return buildPageMetadata({
    title: content.title,
    description: content.description,
    pathname: "/about",
  });
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const content = copy[locale];
  return (
    <Section>
      <Container className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div><SectionHeader eyebrow={content.eyebrow} title={content.heroTitle} body={content.heroBody} /><div className="grid gap-3 text-muted">{content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div>
        <ProductVisual label={content.visualLabel} className="min-h-[560px]" />
      </Container>
    </Section>
  );
}
