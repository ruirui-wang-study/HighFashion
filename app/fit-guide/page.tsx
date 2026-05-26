import type { Metadata } from "next";
import { Ruler, ShieldCheck, Waves } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { getManagedStaticPageByPathname, type FitGuideStaticPageContent } from "@/data/static-pages";
import { getPublishedStaticPage } from "@/lib/content-api";
import { buildPageMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";

const fitGuideIcons = [Ruler, Waves, ShieldCheck] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const page = await getPublishedStaticPage("/fit-guide", locale);
  const fallback = getManagedStaticPageByPathname("/fit-guide");

  return buildPageMetadata({
    title: page?.seoTitle ?? fallback?.seoTitle ?? "Fit Guide",
    description: page?.seoDescription ?? fallback?.seoDescription ?? "",
    pathname: "/fit-guide",
  });
}

export default async function FitGuidePage() {
  const locale = await getServerLocale();
  const page = await getPublishedStaticPage("/fit-guide", locale);
  const fallback = getManagedStaticPageByPathname("/fit-guide");
  const content = (page?.pageKey === "FIT_GUIDE"
    ? page.content
    : locale === "zh"
      ? (fallback?.contentZh ?? fallback?.content)
      : fallback?.content) as FitGuideStaticPageContent | undefined;

  if (!content) {
    return null;
  }

  return (
    <Section>
      <Container>
        <SectionHeader eyebrow={content.eyebrow} title={content.title} body={content.body} />
        <div className="grid gap-4 lg:grid-cols-3">
          {content.cards.map(({ title }, index) => {
            const Icon = fitGuideIcons[index] ?? ShieldCheck;
            return (
              <div key={title} className="rounded-[1.5rem] bg-white p-6">
                <Icon className="h-7 w-7 text-signal" />
                <p className="mt-12 font-display text-3xl font-black uppercase tracking-[-0.05em]">{title}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-graphite/10 bg-white">
          <div className="grid grid-cols-3 bg-graphite p-4 text-xs font-bold uppercase tracking-[0.16em] text-white">
            <span>{content.headers.product}</span>
            <span>{content.headers.measure}</span>
            <span>{content.headers.fitCheck}</span>
          </div>
          {content.rows.map((row) => (
            <div key={`${row.product}-${row.measure}`} className="grid grid-cols-3 border-t border-graphite/10 p-4 text-sm">
              <span className="font-bold">{row.product}</span>
              <span className="text-muted">{row.measure}</span>
              <span className="text-muted">{row.fitCheck}</span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
