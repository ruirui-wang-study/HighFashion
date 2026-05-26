"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateAdminCollectionLanding } from "@/lib/admin-api";
import type { AdminCollectionLanding, AdminCollectionLandingPayload } from "@/lib/admin-content-types";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./admin-page-header";

function toPayload(page: AdminCollectionLanding): AdminCollectionLandingPayload {
  return {
    title: page.title,
    titleEn: page.titleEn ?? "",
    titleZh: page.titleZh ?? "",
    slug: page.slug,
    pathname: page.pathname,
    scenario: page.scenario,
    status: page.status,
    seoTitle: page.seoTitle,
    seoTitleEn: page.seoTitleEn ?? "",
    seoTitleZh: page.seoTitleZh ?? "",
    seoDescription: page.seoDescription,
    seoDescriptionEn: page.seoDescriptionEn ?? "",
    seoDescriptionZh: page.seoDescriptionZh ?? "",
    intro: page.intro,
    introEn: page.introEn ?? "",
    introZh: page.introZh ?? "",
    category: page.category,
    useCase: page.useCase,
    relatedGuideSlugs: page.relatedGuideSlugs,
  };
}

export function AdminCollectionLandingEditor({ page }: { page: AdminCollectionLanding }) {
  const router = useRouter();
  const { locale, messages } = useLocale();
  const zh = locale === "zh";
  const [form, setForm] = useState<AdminCollectionLandingPayload>(toPayload(page));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof AdminCollectionLandingPayload>(key: K, value: AdminCollectionLandingPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const saved = await updateAdminCollectionLanding(page.id, form);
      setForm(toPayload(saved));
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "保存 collection 落地页失败" : "Failed to save collection landing");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={zh ? "内容" : "Content"}
        title={page.title}
        body={zh ? "编辑双语 collection 落地页文案，同时避免放开不可控的 SEO 路由创建。" : "Edit bilingual collection landing copy without opening up uncontrolled SEO route creation."}
      />

      <section className="rounded-3xl bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "标题" : "Title"}
            <input value={form.title} onChange={(event) => setField("title", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "标题（EN）" : "Title (EN)"}
            <input value={form.titleEn ?? ""} onChange={(event) => setField("titleEn", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "标题（ZH）" : "Title (ZH)"}
            <input value={form.titleZh ?? ""} onChange={(event) => setField("titleZh", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">Slug
            <input value={form.slug} onChange={(event) => setField("slug", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "路径名" : "Pathname"}
            <input value={form.pathname} onChange={(event) => setField("pathname", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "场景" : "Scenario"}
            <input value={form.scenario ?? ""} onChange={(event) => setField("scenario", event.target.value || null)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "分类" : "Category"}
            <input value={form.category ?? ""} onChange={(event) => setField("category", event.target.value || null)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "使用场景" : "Use case"}
            <input value={form.useCase ?? ""} onChange={(event) => setField("useCase", event.target.value || null)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "SEO 标题" : "SEO title"}
            <input value={form.seoTitle ?? ""} onChange={(event) => setField("seoTitle", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "SEO 标题（EN）" : "SEO title (EN)"}
            <input value={form.seoTitleEn ?? ""} onChange={(event) => setField("seoTitleEn", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "SEO 标题（ZH）" : "SEO title (ZH)"}
            <input value={form.seoTitleZh ?? ""} onChange={(event) => setField("seoTitleZh", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "SEO 描述" : "SEO description"}
            <textarea value={form.seoDescription ?? ""} onChange={(event) => setField("seoDescription", event.target.value)} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "SEO 描述（EN）" : "SEO description (EN)"}
            <textarea value={form.seoDescriptionEn ?? ""} onChange={(event) => setField("seoDescriptionEn", event.target.value)} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "SEO 描述（ZH）" : "SEO description (ZH)"}
            <textarea value={form.seoDescriptionZh ?? ""} onChange={(event) => setField("seoDescriptionZh", event.target.value)} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "简介" : "Intro"}
            <textarea value={form.intro ?? ""} onChange={(event) => setField("intro", event.target.value)} className="min-h-32 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "简介（EN）" : "Intro (EN)"}
            <textarea value={form.introEn ?? ""} onChange={(event) => setField("introEn", event.target.value)} className="min-h-32 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "简介（ZH）" : "Intro (ZH)"}
            <textarea value={form.introZh ?? ""} onChange={(event) => setField("introZh", event.target.value)} className="min-h-32 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "关联 guide slugs" : "Related guide slugs"}
            <input value={form.relatedGuideSlugs.join(", ")} onChange={(event) => setField("relatedGuideSlugs", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
        </div>
      </section>

      {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
      <Button onClick={save} disabled={saving}>{saving ? messages.admin.common.saving : zh ? "保存 collection 落地页" : "Save collection landing"}</Button>
    </div>
  );
}
