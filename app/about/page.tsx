import type { Metadata } from "next";
import { ProductVisual } from "@/components/product-visual";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { getManagedStaticPageByPathname, type AboutStaticPageContent } from "@/data/static-pages";
import { getPublishedStaticPage } from "@/lib/content-api";
import { buildPageMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const page = await getPublishedStaticPage("/about", locale);
  const fallback = getManagedStaticPageByPathname("/about");

  return buildPageMetadata({
    title: page?.seoTitle ?? fallback?.seoTitle ?? "About PulseGear",
    description: page?.seoDescription ?? fallback?.seoDescription ?? "",
    pathname: "/about",
  });
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const page = await getPublishedStaticPage("/about", locale);
  const fallback = getManagedStaticPageByPathname("/about");
  const content = (page?.pageKey === "ABOUT"
    ? page.content
    : locale === "zh"
      ? (fallback?.contentZh ?? fallback?.content)
      : fallback?.content) as AboutStaticPageContent | undefined;

  if (!content) {
    return null;
  }

  return (
    <Section>
      <Container className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <SectionHeader eyebrow={content.eyebrow} title={content.heroTitle} body={content.heroBody} />
          <p className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-graphite">
            PulseGear is a DTC sports accessories brand focused on lightweight support, carry, hydration, and sweat-control gear for running, training, and court sports.
          </p>
          <div className="grid gap-3 text-muted">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <ProductVisual label={content.visualLabel} className="min-h-[560px]" />
      </Container>
    </Section>
  );
}
