"use client";

import { useEffect, useState } from "react";
import { getAdminFaq, updateAdminFaq } from "@/lib/admin-api";
import type { AdminFaq, AdminFaqPayload } from "@/lib/admin-content-types";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./admin-page-header";
import { RepeatableListEditor } from "./repeatable-list-editor";

export function AdminFaqPage() {
  const [faq, setFaq] = useState<AdminFaq | null>(null);
  const [form, setForm] = useState<AdminFaqPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminFaq()
      .then((data) => {
        if (!active) return;
        setFaq(data);
        setForm({
          title: data.title,
          slug: data.slug,
          status: data.status,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          items: data.items,
        });
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load FAQ");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await updateAdminFaq(form);
      setFaq(saved);
      setForm({
        title: saved.title,
        slug: saved.slug,
        status: saved.status,
        seoTitle: saved.seoTitle,
        seoDescription: saved.seoDescription,
        items: saved.items,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <p className="text-sm text-muted">Loading FAQ...</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="FAQ"
        body="Keep global support answers up to date and stored in the content system."
      />

      <section className="rounded-3xl bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-graphite">
            Title
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            Slug
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
        </div>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-graphite">
            SEO title
            <input value={form.seoTitle ?? ""} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            SEO description
            <textarea value={form.seoDescription ?? ""} onChange={(event) => setForm({ ...form, seoDescription: event.target.value })} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
        </div>
      </section>

      <RepeatableListEditor
        title="FAQ items"
        items={form.items}
        emptyItem={{ question: "", answer: "" }}
        fields={[{ key: "question", label: "Question" }, { key: "answer", label: "Answer", multiline: true }]}
        onChange={(items) => setForm({ ...form, items })}
      />

      {faq ? <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Last updated {new Date(faq.updatedAt).toLocaleString("en-US")}</p> : null}
      {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
      <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save FAQ"}</Button>
    </div>
  );
}
