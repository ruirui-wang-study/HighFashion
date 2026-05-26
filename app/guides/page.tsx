import Link from "next/link";
import type { Metadata } from "next";
import { GuideCard } from "@/components/guide-card";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { getPublishedGuides } from "@/lib/content-api";
import { buildGuideMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildGuideMetadata({
    title: locale === "zh" ? "训练指南" : "Training Guides",
    description: locale === "zh"
      ? "浏览 PulseGear 关于护具选择、夏季跑步携带和球场配件的实用购买指南。"
      : "Practical PulseGear guides for choosing knee support, summer run carry, and court sport essentials.",
  });
}

export default async function GuidesPage() {
  const locale = await getServerLocale();
  const guides = await getPublishedGuides(locale);
  const copy = locale === "zh"
    ? {
        home: "首页",
        guides: "指南",
        eyebrow: "指南",
        title: "为支撑与随身装备提供更实用的购买背景",
        body: "浏览跑步、训练、护具、补水和球场场景的购买指南，并查看相关商品与集合。",
      }
    : {
        home: "Home",
        guides: "Guides",
        eyebrow: "Guides",
        title: "Practical buying context for support and carry gear",
        body: "Browse running, training, support, hydration, and court buying guides with product and collection relationships.",
      };

  return (
    <Section>
      <Container>
        <nav className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-graphite">{copy.home}</Link>
          <span className="mx-2">/</span>
          <span className="text-graphite">{copy.guides}</span>
        </nav>
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
        <div className="grid gap-5 lg:grid-cols-3">{guides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}</div>
      </Container>
    </Section>
  );
}
