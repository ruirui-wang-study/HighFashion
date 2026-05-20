import Link from "next/link";
import type { Guide } from "@/lib/types";

export function GuideCard({ guide, variant = "default" }: { guide: Guide; variant?: "default" | "muted" | "dark" }) {
  const className =
    variant === "dark"
      ? "rounded-[1.5rem] bg-white/10 p-5 text-white"
      : variant === "muted"
        ? "rounded-[1.5rem] bg-warm p-5 transition hover:-translate-y-1 hover:shadow-utility"
        : "rounded-[1.5rem] bg-white p-5 transition hover:-translate-y-1 hover:shadow-utility";

  const textClassName = variant === "dark" ? "text-white/65" : "text-muted";

  return (
    <Link href={`/guides/${guide.slug}`} className={className}>
      <div className="mb-5 h-44 rounded-2xl bg-graphite speed-lines" />
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">{guide.category} / {guide.readTime}</p>
      <h2 className="mt-6 font-display text-3xl font-black uppercase leading-none tracking-[-0.05em]">{guide.title}</h2>
      <p className={`mt-3 text-sm leading-6 ${textClassName}`}>{guide.dek}</p>
    </Link>
  );
}
