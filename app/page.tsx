import Link from "next/link";
import { ArrowRight, Dumbbell, Gauge, ShieldCheck, Waves } from "lucide-react";
import { guides } from "@/data/guides";
import { getProducts } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";

const scenes = ["Run", "Train", "Court", "Recover"];
const benefits = [
  { icon: ShieldCheck, title: "No-Slip Support", body: "Grip finishes and shaped compression help gear stay planted." },
  { icon: Waves, title: "Breathable Compression", body: "Mapped knit zones keep support light for summer sessions." },
  { icon: Gauge, title: "No-Bounce Carry", body: "Low-profile storage keeps essentials close to your center of motion." },
  { icon: Dumbbell, title: "Sweat-Ready Materials", body: "Quick-dry fabrics and easy-care finishes for repeat training days." },
];
const bundles = ["Summer Run Kit", "Court Support Kit", "Gym Stability Kit"];

export default function HomePage() {
  const bestSellersPromise = getProducts({ sort: "best" }).catch(() => []);
  return (
    <>
      <Section className="overflow-hidden pt-8 lg:pt-12">
        <Container className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-signal">Performance Utility / Summer Training</p>
            <h1 className="font-display text-6xl font-black uppercase leading-[0.82] tracking-[-0.07em] sm:text-7xl lg:text-8xl">Gear That Moves With You.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">Lightweight support and carry essentials for running, training, and court sports.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" variant="lime"><Link href="/collections/support">Shop Support Gear</Link></Button><Button asChild size="lg" variant="outline"><Link href="/shop">Build Your Training Kit</Link></Button></div>
          </div>
          <ProductVisual label="Run / Train / Court" className="min-h-[520px]" />
        </Container>
      </Section>
      <Section className="pt-0"><Container><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{scenes.map((scene) => <Link key={scene} href={`/shop?useCase=${scene === "Recover" ? "Recovery" : scene}`} className="group rounded-[1.5rem] bg-graphite p-5 text-white speed-lines"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Shop by scenario</p><p className="mt-12 font-display text-4xl font-black uppercase tracking-[-0.05em]">{scene}</p><ArrowRight className="mt-4 transition group-hover:translate-x-2" /></Link>)}</div></Container></Section>
      <BestSellers productsPromise={bestSellersPromise} />
      <Section className="bg-white"><Container><SectionHeader eyebrow="Benefits" title="Built for motion, not shelf appeal" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(({ icon: Icon, title, body }) => <div key={title} className="rounded-[1.5rem] border border-graphite/10 bg-warm p-5"><Icon className="h-7 w-7 text-signal" /><p className="mt-8 font-display text-2xl font-black uppercase tracking-[-0.04em]">{title}</p><p className="mt-3 text-sm leading-6 text-muted">{body}</p></div>)}</div></Container></Section>
      <Section><Container><SectionHeader eyebrow="Kit bundles" title="Build around the way you move" /><div className="grid gap-5 lg:grid-cols-3">{bundles.map((bundle, index) => <div key={bundle} className="rounded-[1.75rem] bg-graphite p-6 text-white speed-lines"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Bundle {index + 1}</p><p className="mt-20 font-display text-4xl font-black uppercase tracking-[-0.05em]">{bundle}</p><p className="mt-3 text-white/65">Support + carry + sweat-ready add-ons for a cleaner kit.</p><Button asChild className="mt-6" variant="lime"><Link href="/shop">Shop kit</Link></Button></div>)}</div></Container></Section>
      <Comparison productsPromise={bestSellersPromise} />
      <Section><Container className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div><SectionHeader eyebrow="Reviews" title="Field notes from training days" body="Mock UGC blocks show where customer photos and verified reviews will live once connected to a review platform." /></div><div className="grid gap-4 sm:grid-cols-2">{["Stayed put through intervals.", "The belt feels invisible after the first mile.", "Clean kit for tennis and gym days.", "Good compression without heat buildup."].map((quote) => <div key={quote} className="rounded-[1.5rem] bg-white p-5"><div className="mb-4 h-32 rounded-2xl bg-graphite speed-lines" /><p className="font-bold">{quote}</p><p className="mt-2 text-sm text-muted">Verified training review</p></div>)}</div></Container></Section>
      <Section className="bg-graphite text-white"><Container><SectionHeader eyebrow="Guides" title="Buy with fit context" body="Short, practical guides help customers choose the right support level and kit setup." /><div className="grid gap-4 lg:grid-cols-3">{guides.map((guide) => <Link key={guide.slug} href={`/guides/${guide.slug}`} className="rounded-[1.5rem] bg-white/10 p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">{guide.category}</p><p className="mt-8 font-display text-3xl font-black uppercase leading-none tracking-[-0.05em]">{guide.title}</p><p className="mt-4 text-sm text-white/65">{guide.dek}</p></Link>)}</div></Container></Section>
    </>
  );
}

async function BestSellers({ productsPromise }: { productsPromise: ReturnType<typeof getProducts> }) {
  const products = (await productsPromise).slice(0, 4);
  return <Section><Container><SectionHeader eyebrow="Best sellers" title="High-frequency training essentials" body="A focused kit of support, carry, hydration, and sweat-control products for warm-weather sessions." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></Container></Section>;
}

async function Comparison({ productsPromise }: { productsPromise: ReturnType<typeof getProducts> }) {
  const products = (await productsPromise).slice(0, 5);
  return <Section className="bg-white"><Container><SectionHeader eyebrow="Compare" title="Choose by training need" /><div className="overflow-hidden rounded-[1.5rem] border border-graphite/10"><div className="grid grid-cols-4 bg-graphite p-4 text-xs font-bold uppercase tracking-[0.16em] text-white"><span>Product</span><span>Best for</span><span>Support</span><span>Carry</span></div>{products.map((product) => <div key={product.id} className="grid grid-cols-4 border-t border-graphite/10 bg-warm p-4 text-sm"><span className="font-bold">{product.title}</span><span>{product.useCases.join(", ")}</span><span>{product.category === "Support" || product.category === "Recovery" ? "High" : "Light"}</span><span>{product.category === "Carry" || product.category === "Hydration" ? "Yes" : "No"}</span></div>)}</div></Container></Section>;
}

