import Link from "next/link";
import type { Metadata } from "next";
import { guides } from "@/data/guides";
import { GuideCard } from "@/components/guide-card";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { buildGuideMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata({
    title: "Training Guides",
    description: "Practical PulseGear guides for choosing knee support, summer run carry, and court sport essentials.",
  });
}

export default function GuidesPage() {
  return (
    <Section>
      <Container>
        <nav className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-graphite">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-graphite">Guides</span>
        </nav>
        <SectionHeader eyebrow="Guides" title="Practical buying context for support and carry gear" body="Browse running, training, support, hydration, and court buying guides built from local guide data with product and collection relationships." />
        <div className="grid gap-5 lg:grid-cols-3">{guides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}</div>
      </Container>
    </Section>
  );
}
