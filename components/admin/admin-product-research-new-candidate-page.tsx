"use client";

import { useState, type ReactNode } from "react";
import { createProductResearchCandidate } from "@/lib/admin-api";
import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";
import { Button } from "@/components/ui/button";

const initialForm = {
  productName: "",
  category: "Support",
  targetMarket: "US",
  source: "MANUAL" as const,
  chineseName: "",
  targetAudience: "",
  useCase: "",
  description: "",
  notes: "",
  brandAngle: "",
  positioningSummary: "",
  alibabaKeywords: "",
  sourceUrl: "",
};

export function AdminProductResearchNewCandidatePageClient() {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createProductResearchCandidate({
        ...form,
        chineseName: form.chineseName || undefined,
        targetAudience: form.targetAudience || undefined,
        useCase: form.useCase || undefined,
        description: form.description || undefined,
        notes: form.notes || undefined,
        brandAngle: form.brandAngle || undefined,
        positioningSummary: form.positioningSummary || undefined,
        alibabaKeywords: form.alibabaKeywords || undefined,
        sourceUrl: form.sourceUrl || undefined,
      });
      setSuccess(`Created candidate ${created.productName}`);
      setForm(initialForm);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create candidate");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminProductResearchSectionShell
      eyebrow="Research"
      title="New Candidate"
      body="Manual research intake still follows the same rule as every other source: the item enters as a candidate first, not as a live product."
    >
      {success ? <p className="text-sm font-bold text-lime-700">{success}</p> : null}
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="rounded-3xl bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Product name"><input value={form.productName} onChange={(event) => patch("productName", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" required /></Field>
          <Field label="Chinese name"><input value={form.chineseName} onChange={(event) => patch("chineseName", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Category"><input value={form.category} onChange={(event) => patch("category", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Target market"><input value={form.targetMarket} onChange={(event) => patch("targetMarket", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Target audience"><input value={form.targetAudience} onChange={(event) => patch("targetAudience", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Use case"><input value={form.useCase} onChange={(event) => patch("useCase", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Brand angle"><input value={form.brandAngle} onChange={(event) => patch("brandAngle", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Alibaba keywords"><input value={form.alibabaKeywords} onChange={(event) => patch("alibabaKeywords", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Source URL"><input value={form.sourceUrl} onChange={(event) => patch("sourceUrl", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Source">
            <select value={form.source} onChange={(event) => patch("source", event.target.value as typeof form.source)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
              <option value="MANUAL">MANUAL</option>
              <option value="AI_GENERATED">AI_GENERATED</option>
              <option value="CSV">CSV</option>
              <option value="ALIBABA_LINK">ALIBABA_LINK</option>
              <option value="SUPPLIER_QUOTE">SUPPLIER_QUOTE</option>
            </select>
          </Field>
          <Field label="Positioning summary" full><textarea value={form.positioningSummary} onChange={(event) => patch("positioningSummary", event.target.value)} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Description" full><textarea value={form.description} onChange={(event) => patch("description", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
          <Field label="Notes" full><textarea value={form.notes} onChange={(event) => patch("notes", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></Field>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="lime" disabled={busy || !form.productName.trim() || !form.category.trim() || !form.targetMarket.trim()} onClick={() => void submit()}>
            {busy ? "Creating..." : "Create Candidate"}
          </Button>
        </div>
      </section>
    </AdminProductResearchSectionShell>
  );
}

function Field({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={full ? "md:col-span-2" : ""}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
    </label>
  );
}
