import Link from "next/link";
import type { Metadata } from "next";
import { guides } from "@/data/guides";
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
        <SectionHeader eyebrow="Guides" title="Practical buying context for support and carry gear" body="Mock content that can later move into a CMS such as Sanity, Contentful, Shopify metaobjects, or MDX." />
        <div className="grid gap-5 lg:grid-cols-3">{guides.map((guide) => <Link key={guide.slug} href={`/guides/${guide.slug}`} className="rounded-[1.5rem] bg-white p-5 transition hover:-translate-y-1 hover:shadow-utility"><div className="mb-5 h-44 rounded-2xl bg-graphite speed-lines" /><p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">{guide.category} / {guide.readTime}</p><h2 className="mt-6 font-display text-3xl font-black uppercase leading-none tracking-[-0.05em]">{guide.title}</h2><p className="mt-3 text-sm leading-6 text-muted">{guide.dek}</p></Link>)}</div>
      </Container>
    </Section>
  );
}
