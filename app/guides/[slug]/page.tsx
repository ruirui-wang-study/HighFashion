import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getGuideBySlug, guides } from "@/data/guides";
import { buildGuideMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
  return {
    title: "Guide Not Found | PulseGear",
  };
  }

  return buildGuideMetadata({
    title: guide.title,
    description: guide.dek,
    slug: guide.slug,
  });
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();
  const relatedGuides = guides.filter((item) => item.slug !== guide.slug);

  return (
    <>
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
        <div className="my-8 h-80 rounded-[1.75rem] bg-graphite speed-lines" />
        <article className="space-y-8">{guide.sections.map((section) => <section key={section.heading} className="rounded-[1.5rem] bg-white p-6"><h2 className="font-display text-3xl font-black uppercase tracking-[-0.05em]">{section.heading}</h2><p className="mt-4 leading-8 text-muted">{section.body}</p></section>)}</article>
        <Button asChild className="mt-8" variant="lime"><Link href="/shop">Shop related gear</Link></Button>
      </Container>
    </Section>
    <Section className="bg-white">
      <Container>
        <SectionHeader eyebrow="Related guides" title="Keep building the kit" body="More practical buying context for running, training, and court sessions." />
        <div className="grid gap-5 md:grid-cols-2">
          {relatedGuides.map((item) => (
            <Link key={item.slug} href={`/guides/${item.slug}`} className="rounded-[1.5rem] bg-warm p-5 transition hover:-translate-y-1 hover:shadow-utility">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">{item.category} / {item.readTime}</p>
              <h2 className="mt-8 font-display text-3xl font-black uppercase leading-none tracking-[-0.05em]">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{item.dek}</p>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
    </>
  );
}


