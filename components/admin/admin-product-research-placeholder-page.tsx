import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";

export function AdminProductResearchPlaceholderPage({
  eyebrow,
  title,
  body,
  workflow,
}: {
  eyebrow: string;
  title: string;
  body: string;
  workflow: string[];
}) {
  return (
    <AdminProductResearchSectionShell eyebrow={eyebrow} title={title} body={body}>
      <section className="rounded-3xl bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Workflow</p>
        <div className="mt-4 grid gap-3">
          {workflow.map((step) => (
            <div key={step} className="rounded-2xl bg-warm px-4 py-3 text-sm text-muted">
              {step}
            </div>
          ))}
        </div>
      </section>
    </AdminProductResearchSectionShell>
  );
}
