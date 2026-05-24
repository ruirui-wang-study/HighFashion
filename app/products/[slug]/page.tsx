import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PackageCheck, Ruler, ShieldCheck, Star } from "lucide-react";
import { categoryToSlug } from "@/lib/category-routes";
import { GuideCard } from "@/components/guide-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getGuidesForProduct } from "@/data/guides";
import { getProduct, getProducts } from "@/lib/api-client";
import { buildProductMetadata } from "@/lib/seo";
import { buildProductBreadcrumbStructuredData, buildProductStructuredData } from "@/lib/structured-data";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ProductVisual, BenefitGrid } from "@/components/product-visual";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) {
    return {
      title: "Product Not Found | PulseGear",
    };
  }
  return buildProductMetadata({
    title: product.title,
    description: product.shortDescription,
    slug: product.slug,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    canonicalUrl: product.canonicalUrl,
    ogImageUrl: product.ogImageUrl,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) notFound();
  const related = (await getProducts({ useCase: product.useCases[0] }).catch(() => [])).filter((item) => item.id !== product.id).slice(0, 3);
  const relatedGuides = getGuidesForProduct(product.slug, [`/collections/${categoryToSlug(product.category)}`]).slice(0, 2);
  return (
    <>
      <JsonLd data={buildProductStructuredData(product)} />
      <JsonLd data={buildProductBreadcrumbStructuredData(product)} />
      <Section>
        <Container className="grid gap-8 lg:grid-cols-[1.08fr_.92fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <ProductVisual label={`${product.title} primary image`} image={product.images[0]} className="sm:col-span-2 sm:min-h-[560px]" />
            <ProductVisual label={`${product.title} detail image`} image={product.images[1]} className="min-h-72" />
            <ProductVisual label={`${product.title} alternate image`} image={product.images[2]} className="min-h-72" />
          </div>
          <ProductPurchasePanel product={product} />
        </Container>
      </Section>
      <Section className="pt-0">
        <Container className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <SectionHeader eyebrow="Key benefits" title="Functional details that matter in motion" />
          <BenefitGrid benefits={product.benefits} />
        </Container>
      </Section>
      <Section id="fit-guide" className="bg-white">
        <Container className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.5rem] bg-warm p-6"><Ruler className="h-7 w-7 text-signal" /><p className="mt-10 font-display text-3xl font-black uppercase tracking-[-0.05em]">Measure for fit</p><p className="mt-3 text-muted">Use a soft tape around the target area while standing relaxed. Pick the size that feels snug but does not restrict motion.</p></div>
          <div className="rounded-[1.5rem] bg-warm p-6"><PackageCheck className="h-7 w-7 text-signal" /><p className="mt-10 font-display text-3xl font-black uppercase tracking-[-0.05em]">Function notes</p><ul className="mt-3 space-y-2 text-muted">{product.features.map((feature) => <li key={feature}>- {feature}</li>)}</ul></div>
          <div className="rounded-[1.5rem] bg-warm p-6"><ShieldCheck className="h-7 w-7 text-signal" /><p className="mt-10 font-display text-3xl font-black uppercase tracking-[-0.05em]">Materials & care</p><p className="mt-3 text-muted">Performance knit or stretch woven blend. Machine wash cold, air dry, avoid bleach and fabric softener.</p></div>
        </Container>
      </Section>
      <Section><Container><SectionHeader eyebrow="Reviews" title="Verified training feedback" /><div className="grid gap-4 md:grid-cols-3">{["Stable without bulky seams.", "Works well in hot gym sessions.", "Easy to pack and clean."].map((review, index) => <div key={review} className="rounded-[1.5rem] bg-white p-5"><div className="mb-4 h-40 rounded-2xl bg-graphite speed-lines" /><div className="flex gap-1">{Array.from({ length: 5 }).map((_, star) => <Star key={star} className="h-4 w-4 fill-lime" />)}</div><p className="mt-4 font-bold">{review}</p><p className="mt-2 text-sm text-muted">Mock customer image {index + 1}</p></div>)}</div></Container></Section>
      {relatedGuides.length > 0 ? <Section><Container><SectionHeader eyebrow="Related guides" title="Choose with more buying context" body="Use these guides to compare fit, support level, and kit setup before you buy." /><div className="grid gap-5 md:grid-cols-2">{relatedGuides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}</div></Container></Section> : null}
      <Section className="bg-white"><Container><SectionHeader eyebrow="Related" title="Complete the kit" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></Container></Section>
    </>
  );
}
