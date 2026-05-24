import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProducts } from "@/lib/api-client";
import { GuideCard } from "@/components/guide-card";
import { GuideRelatedCollections } from "@/components/guide-related-links";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedGuideBySlug, getPublishedGuides } from "@/lib/content-api";
import { buildPageMetadata } from "@/lib/seo";
import { buildGuideArticleStructuredData } from "@/lib/structured-data";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getPublishedGuideBySlug(slug);
  if (!guide) {
    return {
      title: "Guide Not Found | PulseGear",
    };
  }

  return buildPageMetadata({
    title: guide.metaTitle,
    description: guide.metaDescription,
    pathname: `/guides/${guide.slug}`,
  });
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getPublishedGuideBySlug(slug);
  if (!guide) notFound();
  const allProducts = await getProducts().catch(() => []);
  const allGuides = await getPublishedGuides();
  const relatedProducts = guide.relatedProducts
    .map((productSlug) => allProducts.find((product) => product.slug === productSlug))
    .filter((product): product is (typeof allProducts)[number] => Boolean(product));
  const relatedGuides = guide.relatedGuides
    .map((relatedSlug) => allGuides.find((item) => item.slug === relatedSlug))
    .filter((item): item is (typeof allGuides)[number] => Boolean(item))
    .filter((item) => item.slug !== guide.slug);

  return (
    <>
      <JsonLd data={buildGuideArticleStructuredData(guide)} />
      <Section>
        <Container className="max-w-4xl">
          <nav className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-graphite">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="hover:text-graphite">Guides</Link>
            <span className="mx-2">/</span>
            <span className="text-graphite">{guide.title}</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">{guide.category} / {guide.readTime}</p>
          <h1 className="mt-5 font-display text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-7xl">{guide.title}</h1>
          <p className="mt-5 text-xl leading-8 text-muted">{guide.dek}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>{guide.author.name}</span>
            <span>Published {guide.publishedAt}</span>
            <span>Updated {guide.updatedAt}</span>
          </div>
          <div className="my-8 h-80 rounded-[1.75rem] bg-graphite speed-lines" />
          <div className="rounded-[1.5rem] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Contents</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {guide.sections.map((section, index) => {
                const id = `section-${index + 1}`;
                return <a key={section.heading} href={`#${id}`} className="rounded-2xl bg-warm px-4 py-3 text-sm font-bold hover:bg-lime">{section.heading}</a>;
              })}
            </div>
          </div>
          <div className="mt-6 rounded-[1.5rem] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Related collections</p>
            <div className="mt-4">
              <GuideRelatedCollections collections={guide.relatedCollections} />
            </div>
          </div>
          <article className="mt-8 space-y-8">
            {guide.sections.map((section, index) => (
              <section id={`section-${index + 1}`} key={section.heading} className="rounded-[1.5rem] bg-white p-6">
                <h2 className="font-display text-3xl font-black uppercase tracking-[-0.05em]">{section.heading}</h2>
                <p className="mt-4 leading-8 text-muted">{section.body}</p>
              </section>
            ))}
          </article>
          <div className="mt-8 rounded-[1.5rem] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Guide FAQ</p>
            <div className="mt-4 space-y-4">
              {guide.faq.map((item) => (
                <div key={item.question} className="rounded-2xl bg-warm p-5">
                  <h2 className="text-lg font-black">{item.question}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
          <Button asChild className="mt-8" variant="lime"><Link href="/shop">Shop related gear</Link></Button>
        </Container>
      </Section>
      <Section className="bg-white">
        <Container>
          <SectionHeader eyebrow="Related products" title="Shop the gear mentioned in this guide" body="Jump from the buying guide into the products and collections that match the use case." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <SectionHeader eyebrow="Related guides" title="Keep building the kit" body="More practical buying context for running, training, and court sessions." />
          <div className="grid gap-5 md:grid-cols-2">
            {relatedGuides.map((item) => <GuideCard key={item.slug} guide={item} variant="muted" />)}
          </div>
        </Container>
      </Section>
    </>
  );
}


