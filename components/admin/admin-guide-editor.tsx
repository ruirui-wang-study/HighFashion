"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { archiveAdminGuide, createAdminGuide, draftAdminGuide, publishAdminGuide, updateAdminGuide } from "@/lib/admin-api";
import type { AdminGuide, AdminGuideCollectionLink, AdminGuideFaqItem, AdminGuidePayload, AdminGuideSection } from "@/lib/admin-content-types";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { AdminGuidePreview } from "./admin-guide-preview";
import { ContentStatusBadge } from "./content-status-badge";
import { RepeatableListEditor } from "./repeatable-list-editor";

const emptyGuide: AdminGuidePayload = {
  title: "",
  titleEn: "",
  titleZh: "",
  slug: "",
  status: "DRAFT",
  seoTitle: "",
  seoTitleEn: "",
  seoTitleZh: "",
  seoDescription: "",
  seoDescriptionEn: "",
  seoDescriptionZh: "",
  dek: "",
  dekEn: "",
  dekZh: "",
  category: "",
  categoryEn: "",
  categoryZh: "",
  authorName: "",
  authorRole: "",
  authorRoleEn: "",
  authorRoleZh: "",
  readTime: "",
  readTimeEn: "",
  readTimeZh: "",
  sections: [
    { heading: "Direct Answer", body: "" },
    { heading: "Summary", body: "" },
    { heading: "Comparison Table", body: "" },
    { heading: "Best For", body: "" },
    { heading: "How to Choose", body: "" },
    { heading: "Common Mistakes", body: "" },
    { heading: "Recommended Products", body: "" },
    { heading: "Related Guides", body: "" },
    { heading: "Related Collections", body: "" },
  ],
  sectionsEn: [
    { heading: "Direct Answer", body: "" },
    { heading: "Summary", body: "" },
    { heading: "Comparison Table", body: "" },
    { heading: "Best For", body: "" },
    { heading: "How to Choose", body: "" },
    { heading: "Common Mistakes", body: "" },
    { heading: "Recommended Products", body: "" },
    { heading: "Related Guides", body: "" },
    { heading: "Related Collections", body: "" },
  ],
  sectionsZh: [
    { heading: "Direct Answer", body: "" },
    { heading: "Summary", body: "" },
    { heading: "Comparison Table", body: "" },
    { heading: "Best For", body: "" },
    { heading: "How to Choose", body: "" },
    { heading: "Common Mistakes", body: "" },
    { heading: "Recommended Products", body: "" },
    { heading: "Related Guides", body: "" },
    { heading: "Related Collections", body: "" },
  ],
  faq: [{ question: "", answer: "" }],
  faqEn: [{ question: "", answer: "" }],
  faqZh: [{ question: "", answer: "" }],
  relatedProducts: [],
  relatedCollections: [],
  relatedGuides: [],
};

export function AdminGuideEditor({ guide }: { guide?: AdminGuide | null }) {
  const router = useRouter();
  const { locale, messages } = useLocale();
  const zh = locale === "zh";
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
      setError(nextError instanceof Error ? nextError.message : zh ? "保存 guide 失败" : "Failed to save guide");
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
      setError(nextError instanceof Error ? nextError.message : zh ? "更新状态失败" : "Failed to update status");
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
              <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-[-0.04em]">{guide ? (zh ? "编辑 guide" : "Edit guide") : (zh ? "新建 guide" : "New guide")}</h2>
            </div>
            <ContentStatusBadge status={form.status} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "标题" : "Title"}
              <input value={form.title} onChange={(event) => setField("title", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "标题（EN）" : "Title (EN)"}
              <input value={form.titleEn ?? ""} onChange={(event) => setField("titleEn", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "标题（ZH）" : "Title (ZH)"}
              <input value={form.titleZh ?? ""} onChange={(event) => setField("titleZh", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              Slug
              <input value={form.slug} onChange={(event) => setField("slug", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "分类" : "Category"}
              <input value={form.category} onChange={(event) => setField("category", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "分类（EN）" : "Category (EN)"}
              <input value={form.categoryEn ?? ""} onChange={(event) => setField("categoryEn", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "分类（ZH）" : "Category (ZH)"}
              <input value={form.categoryZh ?? ""} onChange={(event) => setField("categoryZh", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "阅读时长" : "Read time"}
              <input value={form.readTime} onChange={(event) => setField("readTime", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "阅读时长（EN）" : "Read time (EN)"}
              <input value={form.readTimeEn ?? ""} onChange={(event) => setField("readTimeEn", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "阅读时长（ZH）" : "Read time (ZH)"}
              <input value={form.readTimeZh ?? ""} onChange={(event) => setField("readTimeZh", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "作者名" : "Author name"}
              <input value={form.authorName} onChange={(event) => setField("authorName", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "作者角色" : "Author role"}
              <input value={form.authorRole} onChange={(event) => setField("authorRole", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "作者角色（EN）" : "Author role (EN)"}
              <input value={form.authorRoleEn ?? ""} onChange={(event) => setField("authorRoleEn", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "作者角色（ZH）" : "Author role (ZH)"}
              <input value={form.authorRoleZh ?? ""} onChange={(event) => setField("authorRoleZh", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-bold text-graphite">
            {zh ? "导语" : "Dek"}
            <textarea value={form.dek} onChange={(event) => setField("dek", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="mt-4 grid gap-2 text-sm font-bold text-graphite">
            {zh ? "导语（EN）" : "Dek (EN)"}
            <textarea value={form.dekEn ?? ""} onChange={(event) => setField("dekEn", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
          <label className="mt-4 grid gap-2 text-sm font-bold text-graphite">
            {zh ? "导语（ZH）" : "Dek (ZH)"}
            <textarea value={form.dekZh ?? ""} onChange={(event) => setField("dekZh", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
          </label>
        </section>

        <section className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">SEO</p>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "SEO 标题" : "SEO title"}
              <input value={form.seoTitle ?? ""} onChange={(event) => setField("seoTitle", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "SEO 标题（EN）" : "SEO title (EN)"}
              <input value={form.seoTitleEn ?? ""} onChange={(event) => setField("seoTitleEn", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "SEO 标题（ZH）" : "SEO title (ZH)"}
              <input value={form.seoTitleZh ?? ""} onChange={(event) => setField("seoTitleZh", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "SEO 描述" : "SEO description"}
              <textarea value={form.seoDescription ?? ""} onChange={(event) => setField("seoDescription", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "SEO 描述（EN）" : "SEO description (EN)"}
              <textarea value={form.seoDescriptionEn ?? ""} onChange={(event) => setField("seoDescriptionEn", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "SEO 描述（ZH）" : "SEO description (ZH)"}
              <textarea value={form.seoDescriptionZh ?? ""} onChange={(event) => setField("seoDescriptionZh", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
          </div>
        </section>

        <RepeatableListEditor<AdminGuideSection>
          title={zh ? "正文分段" : "Sections"}
          description={zh ? "保持正文结构化，前台文章渲染层才能保持简单。" : "Keep body content structured so the storefront article renderer can stay simple."}
          items={form.sections}
          emptyItem={{ heading: "", body: "" }}
          fields={[{ key: "heading", label: zh ? "标题" : "Heading" }, { key: "body", label: zh ? "正文" : "Body", multiline: true }]}
          onChange={(items) => setField("sections", items)}
        />
        <RepeatableListEditor<AdminGuideSection>
          title={zh ? "正文分段（EN）" : "Sections (EN)"}
          items={form.sectionsEn}
          emptyItem={{ heading: "", body: "" }}
          fields={[{ key: "heading", label: zh ? "标题" : "Heading" }, { key: "body", label: zh ? "正文" : "Body", multiline: true }]}
          onChange={(items) => setField("sectionsEn", items)}
        />
        <RepeatableListEditor<AdminGuideSection>
          title={zh ? "正文分段（ZH）" : "Sections (ZH)"}
          items={form.sectionsZh}
          emptyItem={{ heading: "", body: "" }}
          fields={[{ key: "heading", label: zh ? "标题" : "Heading" }, { key: "body", label: zh ? "正文" : "Body", multiline: true }]}
          onChange={(items) => setField("sectionsZh", items)}
        />

        <RepeatableListEditor<AdminGuideFaqItem>
          title={zh ? "嵌入 FAQ" : "Embedded FAQ"}
          items={form.faq}
          emptyItem={{ question: "", answer: "" }}
          fields={[{ key: "question", label: zh ? "问题" : "Question" }, { key: "answer", label: zh ? "答案" : "Answer", multiline: true }]}
          onChange={(items) => setField("faq", items)}
        />
        <RepeatableListEditor<AdminGuideFaqItem>
          title={zh ? "嵌入 FAQ（EN）" : "Embedded FAQ (EN)"}
          items={form.faqEn}
          emptyItem={{ question: "", answer: "" }}
          fields={[{ key: "question", label: zh ? "问题" : "Question" }, { key: "answer", label: zh ? "答案" : "Answer", multiline: true }]}
          onChange={(items) => setField("faqEn", items)}
        />
        <RepeatableListEditor<AdminGuideFaqItem>
          title={zh ? "嵌入 FAQ（ZH）" : "Embedded FAQ (ZH)"}
          items={form.faqZh}
          emptyItem={{ question: "", answer: "" }}
          fields={[{ key: "question", label: zh ? "问题" : "Question" }, { key: "answer", label: zh ? "答案" : "Answer", multiline: true }]}
          onChange={(items) => setField("faqZh", items)}
        />

        <section className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "关联" : "Relations"}</p>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "关联商品" : "Related products"}
              <input value={form.relatedProducts.join(", ")} onChange={(event) => setField("relatedProducts", splitList(event.target.value))} placeholder="pulseflex-knee-sleeve, pulseband-patella-strap" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">
              {zh ? "关联 guides" : "Related guides"}
              <input value={form.relatedGuides.join(", ")} onChange={(event) => setField("relatedGuides", splitList(event.target.value))} placeholder="other-guide, next-guide" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
          </div>
        </section>

        <RepeatableListEditor<AdminGuideCollectionLink>
          title={zh ? "关联 collections" : "Related collections"}
          items={form.relatedCollections}
          emptyItem={{ title: "", path: "" }}
          fields={[{ key: "title", label: zh ? "标签" : "Label" }, { key: "path", label: zh ? "路径" : "Path" }]}
          onChange={(items) => setField("relatedCollections", items)}
        />

        {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button onClick={save} disabled={saving}>{saving ? messages.admin.common.saving : guide ? (zh ? "保存 guide" : "Save guide") : (zh ? "创建 guide" : "Create guide")}</Button>
          {guide ? <Button variant="outline" onClick={() => changeStatus("publish")} disabled={saving}>{zh ? "发布" : "Publish"}</Button> : null}
          {guide ? <Button variant="outline" onClick={() => changeStatus("draft")} disabled={saving}>{zh ? "移回草稿" : "Move to draft"}</Button> : null}
          {guide ? <Button variant="outline" onClick={() => changeStatus("archive")} disabled={saving}>{zh ? "归档" : "Archive"}</Button> : null}
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
    titleEn: guide.titleEn ?? "",
    titleZh: guide.titleZh ?? "",
    slug: guide.slug,
    status: guide.status,
    seoTitle: guide.seoTitle ?? "",
    seoTitleEn: guide.seoTitleEn ?? "",
    seoTitleZh: guide.seoTitleZh ?? "",
    seoDescription: guide.seoDescription ?? "",
    seoDescriptionEn: guide.seoDescriptionEn ?? "",
    seoDescriptionZh: guide.seoDescriptionZh ?? "",
    dek: guide.dek,
    dekEn: guide.dekEn ?? "",
    dekZh: guide.dekZh ?? "",
    category: guide.category,
    categoryEn: guide.categoryEn ?? "",
    categoryZh: guide.categoryZh ?? "",
    authorName: guide.authorName,
    authorRole: guide.authorRole,
    authorRoleEn: guide.authorRoleEn ?? "",
    authorRoleZh: guide.authorRoleZh ?? "",
    readTime: guide.readTime,
    readTimeEn: guide.readTimeEn ?? "",
    readTimeZh: guide.readTimeZh ?? "",
    sections: guide.sections,
    sectionsEn: guide.sectionsEn.length ? guide.sectionsEn : [{ heading: "", body: "" }],
    sectionsZh: guide.sectionsZh.length ? guide.sectionsZh : [{ heading: "", body: "" }],
    faq: guide.faq,
    faqEn: guide.faqEn.length ? guide.faqEn : [{ question: "", answer: "" }],
    faqZh: guide.faqZh.length ? guide.faqZh : [{ question: "", answer: "" }],
    relatedProducts: guide.relatedProducts,
    relatedCollections: guide.relatedCollections,
    relatedGuides: guide.relatedGuides,
  };
}
