"use client";

import { useEffect, useState } from "react";
import { getAdminFaq, updateAdminFaq } from "@/lib/admin-api";
import type { AdminFaq, AdminFaqPayload } from "@/lib/admin-content-types";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./admin-page-header";
import { RepeatableListEditor } from "./repeatable-list-editor";

export function AdminFaqPage() {
  const { locale, messages } = useLocale();
  const zh = locale === "zh";
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
          titleEn: data.titleEn,
          titleZh: data.titleZh,
          slug: data.slug,
          status: data.status,
          seoTitle: data.seoTitle,
          seoTitleEn: data.seoTitleEn,
          seoTitleZh: data.seoTitleZh,
          seoDescription: data.seoDescription,
          seoDescriptionEn: data.seoDescriptionEn,
          seoDescriptionZh: data.seoDescriptionZh,
          items: data.items,
          itemsEn: data.itemsEn,
          itemsZh: data.itemsZh,
        });
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载 FAQ 失败" : "Failed to load FAQ");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [zh]);

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await updateAdminFaq(form);
      setFaq(saved);
      setForm({
        title: saved.title,
        titleEn: saved.titleEn,
        titleZh: saved.titleZh,
        slug: saved.slug,
        status: saved.status,
        seoTitle: saved.seoTitle,
        seoTitleEn: saved.seoTitleEn,
        seoTitleZh: saved.seoTitleZh,
        seoDescription: saved.seoDescription,
        seoDescriptionEn: saved.seoDescriptionEn,
        seoDescriptionZh: saved.seoDescriptionZh,
        items: saved.items,
        itemsEn: saved.itemsEn,
        itemsZh: saved.itemsZh,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "保存 FAQ 失败" : "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <p className="text-sm text-muted">{zh ? "正在加载 FAQ..." : "Loading FAQ..."}</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={zh ? "内容" : "Content"}
        title="FAQ"
        body={zh ? "维护全站支持问答，并将内容统一保存在内容系统中。" : "Keep global support answers up to date and stored in the content system."}
      />

      <section className="rounded-3xl bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-graphite">
            {zh ? "标题" : "Title"}
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            {zh ? "标题（EN）" : "Title (EN)"}
            <input value={form.titleEn ?? ""} onChange={(event) => setForm({ ...form, titleEn: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            {zh ? "标题（ZH）" : "Title (ZH)"}
            <input value={form.titleZh ?? ""} onChange={(event) => setForm({ ...form, titleZh: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            Slug
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
        </div>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-graphite">
            {zh ? "SEO 标题" : "SEO title"}
            <input value={form.seoTitle ?? ""} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            {zh ? "SEO 标题（EN）" : "SEO title (EN)"}
            <input value={form.seoTitleEn ?? ""} onChange={(event) => setForm({ ...form, seoTitleEn: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            {zh ? "SEO 标题（ZH）" : "SEO title (ZH)"}
            <input value={form.seoTitleZh ?? ""} onChange={(event) => setForm({ ...form, seoTitleZh: event.target.value })} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            {zh ? "SEO 描述" : "SEO description"}
            <textarea value={form.seoDescription ?? ""} onChange={(event) => setForm({ ...form, seoDescription: event.target.value })} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            {zh ? "SEO 描述（EN）" : "SEO description (EN)"}
            <textarea value={form.seoDescriptionEn ?? ""} onChange={(event) => setForm({ ...form, seoDescriptionEn: event.target.value })} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">
            {zh ? "SEO 描述（ZH）" : "SEO description (ZH)"}
            <textarea value={form.seoDescriptionZh ?? ""} onChange={(event) => setForm({ ...form, seoDescriptionZh: event.target.value })} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
        </div>
      </section>

      <RepeatableListEditor
        title={zh ? "FAQ 条目" : "FAQ items"}
        items={form.items}
        emptyItem={{ question: "", answer: "" }}
        fields={[{ key: "question", label: zh ? "问题" : "Question" }, { key: "answer", label: zh ? "答案" : "Answer", multiline: true }]}
        onChange={(items) => setForm({ ...form, items })}
      />
      <RepeatableListEditor
        title={zh ? "FAQ 条目（EN）" : "FAQ items (EN)"}
        items={form.itemsEn}
        emptyItem={{ question: "", answer: "" }}
        fields={[{ key: "question", label: zh ? "问题" : "Question" }, { key: "answer", label: zh ? "答案" : "Answer", multiline: true }]}
        onChange={(items) => setForm({ ...form, itemsEn: items })}
      />
      <RepeatableListEditor
        title={zh ? "FAQ 条目（ZH）" : "FAQ items (ZH)"}
        items={form.itemsZh}
        emptyItem={{ question: "", answer: "" }}
        fields={[{ key: "question", label: zh ? "问题" : "Question" }, { key: "answer", label: zh ? "答案" : "Answer", multiline: true }]}
        onChange={(items) => setForm({ ...form, itemsZh: items })}
      />

      {faq ? <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{zh ? "最后更新" : "Last updated"} {new Date(faq.updatedAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}</p> : null}
      {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
      <Button onClick={save} disabled={saving}>{saving ? messages.admin.common.saving : zh ? "保存 FAQ" : "Save FAQ"}</Button>
    </div>
  );
}
