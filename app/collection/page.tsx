import { CollectionView } from "@/components/collection-view";
import { Container, Section, SectionHeader } from "@/components/ui/section";

export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ useCase?: string; category?: string }> }) {
  const params = await searchParams;
  return (
    <Section>
      <Container>
        <SectionHeader eyebrow="Shop" title="Support, carry, hydration, and sweat-ready essentials" body="Filter by category, use case, size, price, and color. Built as mock data now, ready for Shopify collection data later." />
        <CollectionView initialUseCase={params.useCase} initialCategory={params.category} />
      </Container>
    </Section>
  );
}

