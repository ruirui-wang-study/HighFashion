import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PackageCheck, Ruler, ShieldCheck, Star } from "lucide-react";
import { categoryToSlug } from "@/lib/category-routes";
import { GuideCard } from "@/components/guide-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getGuidesForProduct } from "@/data/guides";
import { getProduct, getProducts } from "@/lib/api-client";
import { buildProductMetadata } from "@/lib/seo";
import { getServerLocale } from "@/lib/server-locale";
import { buildProductBreadcrumbStructuredData, buildProductStructuredData } from "@/lib/structured-data";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ProductVisual, BenefitGrid } from "@/components/product-visual";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const locale = await getServerLocale();
  const { slug } = await params;
  const product = await getProduct(slug, locale).catch(() => null);
  if (!product) {
    return {
      title: locale === "zh" ? "未找到商品 | PulseGear" : "Product Not Found | PulseGear",
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
  const locale = await getServerLocale();
  const { slug } = await params;
  const product = await getProduct(slug, locale).catch(() => null);
  if (!product) notFound();
  const related = (await getProducts({ useCase: product.useCases[0], locale }).catch(() => []))
    .filter((item) => item.id !== product.id)
    .slice(0, 3);
  const relatedGuides = getGuidesForProduct(product.slug, [`/collections/${categoryToSlug(product.category)}`]).slice(0, 2);
  const copy = locale === "zh"
    ? {
        benefitsEyebrow: "核心卖点",
        benefitsTitle: "真正影响运动体验的功能细节",
        fitTitle: "测量后再选尺码",
        fitBody: "自然站立，用软尺围绕目标区域测量。选择贴合但不限制动作的尺码。",
        functionTitle: "功能说明",
        materialsTitle: "材质与护理",
        materialsBody: "高性能针织或弹力梭织混纺。冷水机洗，自然晾干，避免漂白和柔顺剂。",
        reviewsEyebrow: "评价",
        reviewsTitle: "训练用户反馈",
        reviewLabel: "示例用户图片",
        relatedGuidesEyebrow: "相关指南",
        relatedGuidesTitle: "带着更多购买判断来选择",
        relatedGuidesBody: "先用这些指南比较贴合度、支撑等级和套装搭配，再决定购买。",
        relatedEyebrow: "相关商品",
        relatedTitle: "补齐整套装备",
        reviewQuotes: ["稳定但不厚重。", "高温训练时也很好用。", "易于收纳，也容易清洗。"],
      }
    : {
        benefitsEyebrow: "Key benefits",
        benefitsTitle: "Functional details that matter in motion",
        fitTitle: "Measure for fit",
        fitBody: "Use a soft tape around the target area while standing relaxed. Pick the size that feels snug but does not restrict motion.",
        functionTitle: "Function notes",
        materialsTitle: "Materials & care",
        materialsBody: "Performance knit or stretch woven blend. Machine wash cold, air dry, avoid bleach and fabric softener.",
        reviewsEyebrow: "Reviews",
        reviewsTitle: "Verified training feedback",
        reviewLabel: "Mock customer image",
        relatedGuidesEyebrow: "Related guides",
        relatedGuidesTitle: "Choose with more buying context",
        relatedGuidesBody: "Use these guides to compare fit, support level, and kit setup before you buy.",
        relatedEyebrow: "Related",
        relatedTitle: "Complete the kit",
        reviewQuotes: ["Stable without bulky seams.", "Works well in hot gym sessions.", "Easy to pack and clean."],
      };

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
          <SectionHeader eyebrow={copy.benefitsEyebrow} title={copy.benefitsTitle} />
          <BenefitGrid benefits={product.benefits} />
        </Container>
      </Section>
      <Section id="fit-guide" className="bg-white">
        <Container className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.5rem] bg-warm p-6"><Ruler className="h-7 w-7 text-signal" /><p className="mt-10 font-display text-3xl font-black uppercase tracking-[-0.05em]">{copy.fitTitle}</p><p className="mt-3 text-muted">{copy.fitBody}</p></div>
          <div className="rounded-[1.5rem] bg-warm p-6"><PackageCheck className="h-7 w-7 text-signal" /><p className="mt-10 font-display text-3xl font-black uppercase tracking-[-0.05em]">{copy.functionTitle}</p><ul className="mt-3 space-y-2 text-muted">{product.features.map((feature) => <li key={feature}>- {feature}</li>)}</ul></div>
          <div className="rounded-[1.5rem] bg-warm p-6"><ShieldCheck className="h-7 w-7 text-signal" /><p className="mt-10 font-display text-3xl font-black uppercase tracking-[-0.05em]">{copy.materialsTitle}</p><p className="mt-3 text-muted">{copy.materialsBody}</p></div>
        </Container>
      </Section>
      <Section><Container><SectionHeader eyebrow={copy.reviewsEyebrow} title={copy.reviewsTitle} /><div className="grid gap-4 md:grid-cols-3">{copy.reviewQuotes.map((review, index) => <div key={review} className="rounded-[1.5rem] bg-white p-5"><div className="mb-4 h-40 rounded-2xl bg-graphite speed-lines" /><div className="flex gap-1">{Array.from({ length: 5 }).map((_, star) => <Star key={star} className="h-4 w-4 fill-lime" />)}</div><p className="mt-4 font-bold">{review}</p><p className="mt-2 text-sm text-muted">{copy.reviewLabel} {index + 1}</p></div>)}</div></Container></Section>
      {relatedGuides.length > 0 ? <Section><Container><SectionHeader eyebrow={copy.relatedGuidesEyebrow} title={copy.relatedGuidesTitle} body={copy.relatedGuidesBody} /><div className="grid gap-5 md:grid-cols-2">{relatedGuides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}</div></Container></Section> : null}
      <Section className="bg-white"><Container><SectionHeader eyebrow={copy.relatedEyebrow} title={copy.relatedTitle} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></Container></Section>
    </>
  );
}
