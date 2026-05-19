import { notFound } from "next/navigation";
import { CollectionView } from "@/components/collection-view";
import { categorySlugs, slugToCategory } from "@/lib/category-routes";
import { Container, Section, SectionHeader } from "@/components/ui/section";

export function generateStaticParams() {
  return Object.values(categorySlugs).map((category) => ({ category }));
}

export default async function CategoryCollectionPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = slugToCategory(categorySlug);
  if (!category) notFound();

  return (
    <Section>
      <Container>
        <SectionHeader eyebrow="Collection" title={`${category} gear`} body="Use filters to narrow by sport scenario, size, price, and color." />
        <CollectionView initialCategory={category} />
      </Container>
    </Section>
  );
}
