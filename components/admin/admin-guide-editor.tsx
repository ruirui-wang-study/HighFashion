"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { archiveAdminGuide, createAdminGuide, draftAdminGuide, publishAdminGuide, updateAdminGuide } from "@/lib/admin-api";
import type { AdminGuide, AdminGuideCollectionLink, AdminGuideFaqItem, AdminGuidePayload, AdminGuideSection } from "@/lib/admin-content-types";
import { Button } from "@/components/ui/button";
import { AdminGuidePreview } from "./admin-guide-preview";
import { ContentStatusBadge } from "./content-status-badge";
import { RepeatableListEditor } from "./repeatable-list-editor";

const emptyGuide: AdminGuidePayload = {
  title: "",
  slug: "",
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
  dek: "",
  category: "",
  authorName: "",
  authorRole: "",
  readTime: "",
  sections: [{ heading: "", body: "" }],
  faq: [{ question: "", answer: "" }],
  relatedProducts: [],
  relatedCollections: [],
  relatedGuides: [],
};

export function AdminGuideEditor({ guide }: { guide?: AdminGuide | null }) {
  const router = useRouter();
  const [form, setForm] = useState<AdminGuidePayload>(guide ? toPayload(guide) : emptyGuide);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof AdminGuidePayload>(key: K, value: AdminGuidePayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const saved = guide ? await updateAdminGuide(guide.id, form) : await createAdminGuide(form);
      setForm(toPayload(saved));
      router.push(`/admin/content/guides/${saved.id}`);
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save guide");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(nextAction: "publish" | "archive" | "draft") {
    if (!guide) return;
    setSaving(true);
    setError(null);
    try {
      const updated =
        nextAction === "publish"
          ? await publishAdminGuide(guide.id)
          : nextAction === "archive"
            ? await archiveAdminGuide(guide.id)
            : await draftAdminGuide(guide.id);
      setForm(toPayload(updated));
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Guide editor</p>
              <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-[-0.04em]">{guide ? "Edit guide" : "New guide"}</h2>
            </div>
            <ContentStatusBadge status={form.status} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-graphite">
              Title
              <input value={form.title} onChange={(event) => setField("title", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              Slug
              <input value={form.slug} onChange={(event) => setField("slug", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              Category
              <input value={form.category} onChange={(event) => setField("category", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              Read time
              <input value={form.readTime} onChange={(event) => setField("readTime", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              Author name
              <input value={form.authorName} onChange={(event) => setField("authorName", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              Author role
              <input value={form.authorRole} onChange={(event) => setField("authorRole", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-bold text-graphite">
            Dek
            <textarea value={form.dek} onChange={(event) => setField("dek", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
        </section>

        <section className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">SEO</p>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-graphite">
              SEO title
              <input value={form.seoTitle ?? ""} onChange={(event) => setField("seoTitle", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              SEO description
              <textarea value={form.seoDescription ?? ""} onChange={(event) => setField("seoDescription", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
          </div>
        </section>

        <RepeatableListEditor<AdminGuideSection>
          title="Sections"
          description="Keep body content structured so the storefront article renderer can stay simple."
          items={form.sections}
          emptyItem={{ heading: "", body: "" }}
          fields={[{ key: "heading", label: "Heading" }, { key: "body", label: "Body", multiline: true }]}
          onChange={(items) => setField("sections", items)}
        />

        <RepeatableListEditor<AdminGuideFaqItem>
          title="Embedded FAQ"
          items={form.faq}
          emptyItem={{ question: "", answer: "" }}
          fields={[{ key: "question", label: "Question" }, { key: "answer", label: "Answer", multiline: true }]}
          onChange={(items) => setField("faq", items)}
        />

        <section className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Relations</p>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-graphite">
              Related products
              <input value={form.relatedProducts.join(", ")} onChange={(event) => setField("relatedProducts", splitList(event.target.value))} placeholder="pulseflex-knee-sleeve, pulseband-patella-strap" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              Related guides
              <input value={form.relatedGuides.join(", ")} onChange={(event) => setField("relatedGuides", splitList(event.target.value))} placeholder="other-guide, next-guide" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
          </div>
        </section>

        <RepeatableListEditor<AdminGuideCollectionLink>
          title="Related collections"
          items={form.relatedCollections}
          emptyItem={{ title: "", path: "" }}
          fields={[{ key: "title", label: "Label" }, { key: "path", label: "Path" }]}
          onChange={(items) => setField("relatedCollections", items)}
        />

        {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : guide ? "Save guide" : "Create guide"}</Button>
          {guide ? <Button variant="outline" onClick={() => changeStatus("publish")} disabled={saving}>Publish</Button> : null}
          {guide ? <Button variant="outline" onClick={() => changeStatus("draft")} disabled={saving}>Move to draft</Button> : null}
          {guide ? <Button variant="outline" onClick={() => changeStatus("archive")} disabled={saving}>Archive</Button> : null}
        </div>
      </div>

      <div className="space-y-6">
        <AdminGuidePreview guide={form} />
      </div>
    </div>
  );
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function toPayload(guide: AdminGuide): AdminGuidePayload {
  return {
    title: guide.title,
    slug: guide.slug,
    status: guide.status,
    seoTitle: guide.seoTitle ?? "",
    seoDescription: guide.seoDescription ?? "",
    dek: guide.dek,
    category: guide.category,
    authorName: guide.authorName,
    authorRole: guide.authorRole,
    readTime: guide.readTime,
    sections: guide.sections,
    faq: guide.faq,
    relatedProducts: guide.relatedProducts,
    relatedCollections: guide.relatedCollections,
    relatedGuides: guide.relatedGuides,
  };
}
