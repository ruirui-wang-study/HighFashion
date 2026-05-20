import Link from "next/link";
import type { Guide, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Container, Section, SectionHeader } from "@/components/ui/section";

export function CollectionSeoContent({
  intro,
  relatedGuides,
  relatedProducts,
}: {
  intro: string;
  relatedGuides: Guide[];
  relatedProducts: Product[];
}) {
  return (
    <>
      <Section className="bg-white">
        <Container className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <SectionHeader eyebrow="Collection guide" title="How to shop this category" body={intro} />
          </div>
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Related guides</p>
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
          <SectionHeader eyebrow="Related products" title="Keep building the kit" body="Browse adjacent products that pair naturally with this collection intent." />
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
