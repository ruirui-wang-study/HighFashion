import Link from "next/link";
import { ArrowRight, Dumbbell, Gauge, ShieldCheck, Waves } from "lucide-react";
import type { Metadata } from "next";
import { getManagedStaticPageByPathname, type HomePageStaticPageContent } from "@/data/static-pages";
import { GuideCard } from "@/components/guide-card";
import { getProducts } from "@/lib/api-client";
import { getPublishedGuides, getPublishedStaticPage } from "@/lib/content-api";
import { buildPageMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";

const benefitIcons = [ShieldCheck, Waves, Gauge, Dumbbell] as const;
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const page = await getPublishedStaticPage("/", locale);
  const fallback = getManagedStaticPageByPathname("/");
  const content = (page?.pageKey === "HOME_PAGE"
    ? page.content
    : locale === "zh"
      ? (fallback?.contentZh ?? fallback?.content)
      : fallback?.content) as HomePageStaticPageContent | undefined;

  return buildPageMetadata({
    title: content?.metadataTitle ?? fallback?.seoTitle ?? "PulseGear",
    description: content?.metadataDescription ?? fallback?.seoDescription ?? "",
    pathname: "/",
  });
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const page = await getPublishedStaticPage("/", locale);
  const fallback = getManagedStaticPageByPathname("/");
  const content = (page?.pageKey === "HOME_PAGE"
    ? page.content
    : locale === "zh"
      ? (fallback?.contentZh ?? fallback?.content)
      : fallback?.content) as HomePageStaticPageContent | undefined;
  const bestSellersPromise = getProducts({ sort: "best", locale }).catch(() => []);
  const featuredGuidesPromise = getPublishedGuides(locale).catch(() => []);

  if (!content) {
    return null;
  }

  return (
    <>
      <Section className="overflow-hidden pt-8 lg:pt-12">
        <Container className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-signal">{content.eyebrow}</p>
            <h1 className="font-display text-6xl font-black uppercase leading-[0.82] tracking-[-0.07em] sm:text-7xl lg:text-8xl">{content.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{content.heroBody}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="lime"><Link href="/collections/support">{content.ctas[0]}</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/shop">{content.ctas[1]}</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/guides">{content.ctas[2]}</Link></Button>
            </div>
          </div>
          <ProductVisual label={content.visualLabel} className="min-h-[520px]" />
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.scenes.map((scene, index) => (
              <Link
                key={scene}
                href={content.scenarioLinks[index]}
                className="group rounded-[1.5rem] bg-graphite p-5 text-white speed-lines"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">{content.shopByScenario}</p>
                <p className="mt-12 font-display text-4xl font-black uppercase tracking-[-0.05em]">{scene}</p>
                <ArrowRight className="mt-4 transition group-hover:translate-x-2" />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <BestSellers productsPromise={bestSellersPromise} content={content} />

      <Section className="bg-white">
        <Container>
          <SectionHeader eyebrow={content.benefitsEyebrow} title={content.benefitsTitle} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.benefits.map((benefit, index) => {
              const Icon = benefitIcons[index] ?? ShieldCheck;
              return (
                <div key={benefit.title} className="rounded-[1.5rem] border border-graphite/10 bg-warm p-5">
                  <Icon className="h-7 w-7 text-signal" />
                  <p className="mt-8 font-display text-2xl font-black uppercase tracking-[-0.04em]">{benefit.title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted">{benefit.body}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader eyebrow={content.bundlesEyebrow} title={content.bundlesTitle} />
          <div className="grid gap-5 lg:grid-cols-3">
            {content.bundles.map((bundle, index) => (
              <div key={bundle.title} className="rounded-[1.75rem] bg-graphite p-6 text-white speed-lines">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">{content.bundlePrefix} {index + 1}</p>
                <p className="mt-20 font-display text-4xl font-black uppercase tracking-[-0.05em]">{bundle.title}</p>
                <p className="mt-3 text-white/65">{content.bundleBody}</p>
                <Button asChild className="mt-6" variant="lime"><Link href="/shop">{content.shopKit}</Link></Button>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Comparison productsPromise={bestSellersPromise} content={content} />

      {content.showReviews ? (
        <Section>
          <Container className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <SectionHeader eyebrow={content.reviewsEyebrow} title={content.reviewsTitle} body={content.reviewsBody} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {content.reviewQuotes.map((review) => (
                <div key={review.quote} className="rounded-[1.5rem] bg-white p-5">
                  <div className="mb-4 h-32 rounded-2xl bg-graphite speed-lines" />
                  <p className="font-bold">{review.quote}</p>
                  <p className="mt-2 text-sm text-muted">{content.verifiedReview}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section className="bg-graphite text-white">
        <Container>
          <SectionHeader eyebrow={content.guidesEyebrow} title={content.guidesTitle} body={content.guidesBody} />
          <div className="grid gap-4 lg:grid-cols-3">
            <FeaturedGuides guidesPromise={featuredGuidesPromise} content={content} />
          </div>
          <div className="mt-6">
            <Button asChild variant="lime"><Link href="/guides">{content.browseGuides}</Link></Button>
          </div>
        </Container>
      </Section>
    </>
  );
}

async function FeaturedGuides({
  guidesPromise,
  content,
}: {
  guidesPromise: ReturnType<typeof getPublishedGuides>;
  content: HomePageStaticPageContent;
}) {
  const publishedGuides = await guidesPromise;
  const featuredGuides = content.featuredGuideSlugs
    .map((slug) => publishedGuides.find((guide) => guide.slug === slug))
    .filter((guide): guide is NonNullable<(typeof publishedGuides)[number]> => Boolean(guide));
  const guidesToRender = featuredGuides.length ? featuredGuides : publishedGuides.slice(0, 3);

  return (
    <>
      {guidesToRender.map((guide) => <GuideCard key={guide.slug} guide={guide} variant="dark" />)}
    </>
  );
}

async function BestSellers({
  productsPromise,
  content,
}: {
  productsPromise: ReturnType<typeof getProducts>;
  content: HomePageStaticPageContent;
}) {
  const products = (await productsPromise).slice(0, 4);
  return (
    <Section>
      <Container>
        <SectionHeader eyebrow={content.bestSellersEyebrow} title={content.bestSellersTitle} body={content.bestSellersBody} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </Container>
    </Section>
  );
}

async function Comparison({
  productsPromise,
  content,
}: {
  productsPromise: ReturnType<typeof getProducts>;
  content: HomePageStaticPageContent;
}) {
  const products = (await productsPromise).slice(0, 5);
  return (
    <Section className="bg-white">
      <Container>
        <SectionHeader eyebrow={content.compareEyebrow} title={content.compareTitle} />
        <div className="overflow-hidden rounded-[1.5rem] border border-graphite/10">
          <div className="grid grid-cols-4 bg-graphite p-4 text-xs font-bold uppercase tracking-[0.16em] text-white">
            <span>{content.compareTable[0]}</span>
            <span>{content.compareTable[1]}</span>
            <span>{content.compareTable[2]}</span>
            <span>{content.compareTable[3]}</span>
          </div>
          {products.map((product) => (
            <div key={product.id} className="grid grid-cols-4 border-t border-graphite/10 bg-warm p-4 text-sm">
              <span className="font-bold">{product.title}</span>
              <span>{product.useCases.join(", ")}</span>
              <span>{product.category === "Support" || product.category === "Recovery" ? content.compareSupportHigh : content.compareSupportLight}</span>
              <span>{product.category === "Carry" || product.category === "Hydration" ? content.compareCarryYes : content.compareCarryNo}</span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
