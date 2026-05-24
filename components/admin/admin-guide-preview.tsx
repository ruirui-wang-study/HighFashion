import { GuideRelatedCollections } from "@/components/guide-related-links";
import type { AdminGuidePayload } from "@/lib/admin-content-types";

export function AdminGuidePreview({ guide }: { guide: AdminGuidePayload }) {
  return (
    <section className="rounded-3xl bg-graphite p-6 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime">Preview</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/65">{guide.category} / {guide.readTime}</p>
      <h2 className="mt-4 font-display text-4xl font-black uppercase tracking-[-0.05em]">{guide.title || "Untitled guide"}</h2>
      <p className="mt-4 text-sm leading-7 text-white/75">{guide.dek || "Guide dek preview."}</p>
      <div className="mt-6 rounded-[1.5rem] bg-white p-5 text-graphite">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal">Related collections</p>
        <div className="mt-4">
          <GuideRelatedCollections collections={guide.relatedCollections} />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {guide.sections.slice(0, 2).map((section) => (
          <div key={section.heading} className="rounded-[1.5rem] bg-white/10 p-5">
            <h3 className="font-display text-2xl font-black uppercase tracking-[-0.04em]">{section.heading}</h3>
            <p className="mt-3 text-sm leading-7 text-white/75">{section.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
