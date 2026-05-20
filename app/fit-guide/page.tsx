import type { Metadata } from "next";
import { Ruler, ShieldCheck, Waves } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/seo";

const rows = [
  ["Knee sleeve", "Measure around the kneecap while standing", "Snug compression, no pinching behind knee"],
  ["Patella strap", "Measure below kneecap around upper shin", "Targeted pressure without numbness"],
  ["Running belt", "Measure natural waist over run shorts", "Secure hold with room to breathe"],
  ["Socks", "Match shoe size range", "Heel sits locked, toe seam stays flat"],
];

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Fit Guide",
    description: "Use the PulseGear fit guide to choose support, carry, and sock sizes by measurement and movement.",
    pathname: "/fit-guide",
  });
}

export default function FitGuidePage() {
  return (
    <Section>
      <Container>
        <SectionHeader eyebrow="Fit Guide" title="Choose support by measurement and movement" body="Use these quick checks before selecting a size. Product pages use button groups for fast size selection on mobile." />
        <div className="grid gap-4 lg:grid-cols-3">{[{ icon: Ruler, title: "Measure relaxed" }, { icon: Waves, title: "Check range of motion" }, { icon: ShieldCheck, title: "Fit should stay planted" }].map(({ icon: Icon, title }) => <div key={title} className="rounded-[1.5rem] bg-white p-6"><Icon className="h-7 w-7 text-signal" /><p className="mt-12 font-display text-3xl font-black uppercase tracking-[-0.05em]">{title}</p></div>)}</div>
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-graphite/10 bg-white"><div className="grid grid-cols-3 bg-graphite p-4 text-xs font-bold uppercase tracking-[0.16em] text-white"><span>Product</span><span>Measure</span><span>Fit check</span></div>{rows.map((row) => <div key={row[0]} className="grid grid-cols-3 border-t border-graphite/10 p-4 text-sm"><span className="font-bold">{row[0]}</span><span className="text-muted">{row[1]}</span><span className="text-muted">{row[2]}</span></div>)}</div>
      </Container>
    </Section>
  );
}
