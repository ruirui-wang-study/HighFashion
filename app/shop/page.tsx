import type { Metadata } from "next";
import { CollectionView } from "@/components/collection-view";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    title: locale === "zh" ? "选购 Performance Utility 装备" : "Shop Performance Utility Gear",
    description: locale === "zh"
      ? "浏览 PulseGear 的支撑、收纳、补水、袜品、止汗与恢复类装备。"
      : "Browse PulseGear support, carry, hydration, socks, sweat-control, and recovery essentials.",
    pathname: "/shop",
  });
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ useCase?: string; category?: string }> }) {
  const locale = await getServerLocale();
  const params = await searchParams;
  const copy = locale === "zh"
    ? {
        eyebrow: "商城",
        title: "支撑、收纳、补水与适合高频训练的核心装备",
        body: "可按品类、场景、尺码、价格和颜色筛选，也可按热销、最新或价格排序。",
      }
    : {
        eyebrow: "Shop",
        title: "Support, carry, hydration, and sweat-ready essentials",
        body: "Filter by category, use case, size, price, and color. Sort by best selling, newest, or price.",
      };
  return (
    <Section>
      <Container>
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
        <CollectionView initialUseCase={params.useCase} initialCategory={params.category} />
      </Container>
    </Section>
  );
}
