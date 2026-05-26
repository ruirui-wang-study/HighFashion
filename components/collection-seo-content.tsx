import Link from "next/link";
import type { Guide, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Container, Section, SectionHeader } from "@/components/ui/section";

export function CollectionSeoContent({
  intro,
  relatedGuides,
  relatedProducts,
  locale = "en",
}: {
  intro: string;
  relatedGuides: Guide[];
  relatedProducts: Product[];
  locale?: "en" | "zh";
}) {
  const copy = locale === "zh"
    ? {
        eyebrow: "分类指南",
        title: "如何选购这个分类",
        relatedGuides: "相关指南",
        relatedProductsEyebrow: "相关商品",
        relatedProductsTitle: "继续补齐你的装备方案",
        relatedProductsBody: "浏览与这个分类购买意图自然搭配的周边商品。",
      }
    : {
        eyebrow: "Collection guide",
        title: "How to shop this category",
        relatedGuides: "Related guides",
        relatedProductsEyebrow: "Related products",
        relatedProductsTitle: "Keep building the kit",
        relatedProductsBody: "Browse adjacent products that pair naturally with this collection intent.",
      };
  return (
    <>
      <Section className="bg-white">
        <Container className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <SectionHeader eyebrow={copy.eyebrow} title={copy.title} body={intro} />
          </div>
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">{copy.relatedGuides}</p>
            {relatedGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="block rounded-[1.5rem] border border-graphite/10 bg-warm p-5 transition hover:-translate-y-1 hover:shadow-utility"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">
                  {guide.category} / {guide.readTime}
                </p>
                <h2 className="mt-6 font-display text-3xl font-black uppercase leading-none tracking-[-0.05em]">{guide.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{guide.dek}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <SectionHeader eyebrow={copy.relatedProductsEyebrow} title={copy.relatedProductsTitle} body={copy.relatedProductsBody} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
