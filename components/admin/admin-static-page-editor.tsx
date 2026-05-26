"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateAdminStaticPage } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type {
  AdminAboutStaticPageContent,
  AdminFitGuideStaticPageContent,
  AdminHomePageStaticPageContent,
  AdminStaticPage,
  AdminStaticPagePayload,
} from "@/lib/admin-content-types";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./admin-page-header";

function toPayload(page: AdminStaticPage): AdminStaticPagePayload {
  return {
    pageKey: page.pageKey,
    title: page.title,
    titleEn: page.titleEn ?? "",
    titleZh: page.titleZh ?? "",
    slug: page.slug,
    pathname: page.pathname,
    status: page.status,
    seoTitle: page.seoTitle,
    seoTitleEn: page.seoTitleEn ?? "",
    seoTitleZh: page.seoTitleZh ?? "",
    seoDescription: page.seoDescription,
    seoDescriptionEn: page.seoDescriptionEn ?? "",
    seoDescriptionZh: page.seoDescriptionZh ?? "",
    content: page.content,
    contentEn: page.contentEn ?? page.content,
    contentZh: page.contentZh ?? null,
  };
}

export function AdminStaticPageEditor({ page }: { page: AdminStaticPage }) {
  const router = useRouter();
  const { locale, messages } = useLocale();
  const zh = locale === "zh";
  const [form, setForm] = useState<AdminStaticPagePayload>(toPayload(page));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof AdminStaticPagePayload>(key: K, value: AdminStaticPagePayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateAboutContent(
    locale: "content" | "contentEn" | "contentZh",
    updater: (value: AdminAboutStaticPageContent) => AdminAboutStaticPageContent,
  ) {
    setForm((current) => {
      const existing = (current[locale] ?? current.content) as AdminAboutStaticPageContent;
      return { ...current, [locale]: updater(existing) };
    });
  }

  function updateFitGuideContent(
    locale: "content" | "contentEn" | "contentZh",
    updater: (value: AdminFitGuideStaticPageContent) => AdminFitGuideStaticPageContent,
  ) {
    setForm((current) => {
      const existing = (current[locale] ?? current.content) as AdminFitGuideStaticPageContent;
      return { ...current, [locale]: updater(existing) };
    });
  }

  function updateHomePageContent(
    locale: "content" | "contentEn" | "contentZh",
    updater: (value: AdminHomePageStaticPageContent) => AdminHomePageStaticPageContent,
  ) {
    setForm((current) => {
      const existing = (current[locale] ?? current.content) as AdminHomePageStaticPageContent;
      return { ...current, [locale]: updater(existing) };
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const saved = await updateAdminStaticPage(page.id, form);
      setForm(toPayload(saved));
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "保存静态页面失败" : "Failed to save static page");
    } finally {
      setSaving(false);
    }
  }

  const isAboutPage = form.pageKey === "ABOUT";
  const isFitGuidePage = form.pageKey === "FIT_GUIDE";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={zh ? "内容" : "Content"}
        title={page.title}
        body={zh ? "管理固定前台双语页面，避免把长文案重新散落回路由文件。" : "Manage fixed bilingual storefront pages without scattering long-form marketing copy back into route files."}
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
          <label className="grid gap-2 text-sm font-bold text-graphite">{zh ? "路径名" : "Pathname"}
            <input value={form.pathname} onChange={(event) => setField("pathname", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
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

      {isAboutPage ? (
        <AboutStaticPageFields
          content={form.content as AdminAboutStaticPageContent}
          contentEn={(form.contentEn ?? form.content) as AdminAboutStaticPageContent}
          contentZh={(form.contentZh ?? {
            eyebrow: "",
            heroTitle: "",
            heroBody: "",
            paragraphs: [],
            visualLabel: "",
          }) as AdminAboutStaticPageContent}
          updateAboutContent={updateAboutContent}
        />
      ) : isFitGuidePage ? (
        <FitGuideStaticPageFields
          content={form.content as AdminFitGuideStaticPageContent}
          contentEn={(form.contentEn ?? form.content) as AdminFitGuideStaticPageContent}
          contentZh={(form.contentZh ?? {
            eyebrow: "",
            title: "",
            body: "",
            cards: [],
            headers: { product: "", measure: "", fitCheck: "" },
            rows: [],
          }) as AdminFitGuideStaticPageContent}
          updateFitGuideContent={updateFitGuideContent}
        />
      ) : (
        <HomePageStaticPageFields
          content={form.content as AdminHomePageStaticPageContent}
          contentEn={(form.contentEn ?? form.content) as AdminHomePageStaticPageContent}
          contentZh={(form.contentZh ?? form.content) as AdminHomePageStaticPageContent}
          updateHomePageContent={updateHomePageContent}
        />
      )}

      {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
      <Button onClick={save} disabled={saving}>{saving ? messages.admin.common.saving : zh ? "保存静态页面" : "Save static page"}</Button>
    </div>
  );
}

function HomePageStaticPageFields({
  content,
  contentEn,
  contentZh,
  updateHomePageContent,
}: {
  content: AdminHomePageStaticPageContent;
  contentEn: AdminHomePageStaticPageContent;
  contentZh: AdminHomePageStaticPageContent;
  updateHomePageContent: (
    locale: "content" | "contentEn" | "contentZh",
    updater: (value: AdminHomePageStaticPageContent) => AdminHomePageStaticPageContent,
  ) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {[
        { label: "Base", key: "content", value: content },
        { label: "English", key: "contentEn", value: contentEn },
        { label: "Chinese", key: "contentZh", value: contentZh },
      ].map(({ label, key, value }) => (
        <div key={label} className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{label}</p>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-graphite">Metadata title
              <input value={value.metadataTitle} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, metadataTitle: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Metadata description
              <textarea value={value.metadataDescription} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, metadataDescription: event.target.value }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Hero eyebrow
              <input value={value.eyebrow} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, eyebrow: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Hero title
              <input value={value.heroTitle} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, heroTitle: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Hero body
              <textarea value={value.heroBody} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, heroBody: event.target.value }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Visual label
              <input value={value.visualLabel} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, visualLabel: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Primary CTA labels
              <textarea value={value.ctas.join("\n")} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, ctas: normalizeFixedStringList<3>(event.target.value, current.ctas) }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Scenario eyebrow
              <input value={value.shopByScenario} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, shopByScenario: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Scenario labels
              <textarea value={value.scenes.join("\n")} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, scenes: normalizeFixedStringList<4>(event.target.value, current.scenes) }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Scenario links
              <textarea value={value.scenarioLinks.join("\n")} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, scenarioLinks: normalizeFixedStringList<4>(event.target.value, current.scenarioLinks) }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Benefits eyebrow
              <input value={value.benefitsEyebrow} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, benefitsEyebrow: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Benefits title
              <input value={value.benefitsTitle} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, benefitsTitle: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Benefits
              <textarea value={value.benefits.map((item) => `${item.title} | ${item.body}`).join("\n")} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, benefits: normalizeBenefits(event.target.value, current.benefits) }))} className="min-h-40 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Bundles eyebrow
              <input value={value.bundlesEyebrow} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, bundlesEyebrow: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Bundles title
              <input value={value.bundlesTitle} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, bundlesTitle: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Bundle titles
              <textarea value={value.bundles.map((item) => item.title).join("\n")} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, bundles: normalizeBundleTitles(event.target.value, current.bundles) }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Bundle prefix
              <input value={value.bundlePrefix} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, bundlePrefix: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Bundle body
              <textarea value={value.bundleBody} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, bundleBody: event.target.value }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Bundle CTA
              <input value={value.shopKit} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, shopKit: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Reviews eyebrow
              <input value={value.reviewsEyebrow} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, reviewsEyebrow: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Reviews title
              <input value={value.reviewsTitle} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, reviewsTitle: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Reviews body
              <textarea value={value.reviewsBody} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, reviewsBody: event.target.value }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-graphite">
              <input type="checkbox" checked={value.showReviews} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, showReviews: event.target.checked }))} className="h-4 w-4 rounded border border-graphite/20" />
              Show reviews block
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Review quotes
              <textarea value={value.reviewQuotes.map((item) => item.quote).join("\n")} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, reviewQuotes: normalizeReviewQuotes(event.target.value, current.reviewQuotes) }))} className="min-h-32 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Verified review label
              <input value={value.verifiedReview} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, verifiedReview: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Guides eyebrow
              <input value={value.guidesEyebrow} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, guidesEyebrow: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Guides title
              <input value={value.guidesTitle} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, guidesTitle: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Guides body
              <textarea value={value.guidesBody} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, guidesBody: event.target.value }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Guides CTA
              <input value={value.browseGuides} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, browseGuides: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Featured guide slugs
              <textarea value={value.featuredGuideSlugs.join("\n")} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, featuredGuideSlugs: normalizeFixedStringList<3>(event.target.value, current.featuredGuideSlugs) }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Best sellers eyebrow
              <input value={value.bestSellersEyebrow} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, bestSellersEyebrow: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Best sellers title
              <input value={value.bestSellersTitle} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, bestSellersTitle: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Best sellers body
              <textarea value={value.bestSellersBody} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, bestSellersBody: event.target.value }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Compare eyebrow
              <input value={value.compareEyebrow} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, compareEyebrow: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Compare title
              <input value={value.compareTitle} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, compareTitle: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Compare table labels
              <textarea value={value.compareTable.join("\n")} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, compareTable: normalizeFixedStringList<4>(event.target.value, current.compareTable) }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Compare labels
              <textarea value={[value.compareSupportHigh, value.compareSupportLight, value.compareCarryYes, value.compareCarryNo].join("\n")} onChange={(event) => updateHomePageContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, ...normalizeCompareLabels(event.target.value, current) }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
          </div>
        </div>
      ))}
    </section>
  );
}

function normalizeFixedStringList<TLength extends 3 | 4>(
  raw: string,
  fallback: TLength extends 3 ? [string, string, string] : [string, string, string, string],
) {
  const items = raw.split("\n").map((item) => item.trim()).filter(Boolean);
  if (fallback.length === 3) {
    return [
      items[0] ?? fallback[0],
      items[1] ?? fallback[1],
      items[2] ?? fallback[2],
    ] as TLength extends 3 ? [string, string, string] : [string, string, string, string];
  }
  return [
    items[0] ?? fallback[0],
    items[1] ?? fallback[1],
    items[2] ?? fallback[2],
    items[3] ?? fallback[3],
  ] as TLength extends 3 ? [string, string, string] : [string, string, string, string];
}

function normalizeBenefits(
  raw: string,
  fallback: AdminHomePageStaticPageContent["benefits"],
): AdminHomePageStaticPageContent["benefits"] {
  const items = raw.split("\n").map((item) => item.trim()).filter(Boolean);
  return fallback.map((item, index) => {
    const [title = item.title, body = item.body] = (items[index] ?? "").split("|").map((part) => part.trim());
    return { title, body };
  }) as AdminHomePageStaticPageContent["benefits"];
}

function normalizeBundleTitles(
  raw: string,
  fallback: AdminHomePageStaticPageContent["bundles"],
): AdminHomePageStaticPageContent["bundles"] {
  const items = raw.split("\n").map((item) => item.trim()).filter(Boolean);
  return fallback.map((item, index) => ({ title: items[index] ?? item.title })) as AdminHomePageStaticPageContent["bundles"];
}

function normalizeReviewQuotes(
  raw: string,
  fallback: AdminHomePageStaticPageContent["reviewQuotes"],
): AdminHomePageStaticPageContent["reviewQuotes"] {
  const items = raw.split("\n").map((item) => item.trim()).filter(Boolean);
  return fallback.map((item, index) => ({ quote: items[index] ?? item.quote })) as AdminHomePageStaticPageContent["reviewQuotes"];
}

function normalizeCompareLabels(raw: string, fallback: AdminHomePageStaticPageContent) {
  const items = raw.split("\n").map((item) => item.trim()).filter(Boolean);
  return {
    compareSupportHigh: items[0] ?? fallback.compareSupportHigh,
    compareSupportLight: items[1] ?? fallback.compareSupportLight,
    compareCarryYes: items[2] ?? fallback.compareCarryYes,
    compareCarryNo: items[3] ?? fallback.compareCarryNo,
  };
}

function AboutStaticPageFields({
  content,
  contentEn,
  contentZh,
  updateAboutContent,
}: {
  content: AdminAboutStaticPageContent;
  contentEn: AdminAboutStaticPageContent;
  contentZh: AdminAboutStaticPageContent;
  updateAboutContent: (
    locale: "content" | "contentEn" | "contentZh",
    updater: (value: AdminAboutStaticPageContent) => AdminAboutStaticPageContent,
  ) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {[
        { label: "Base", key: "content", value: content },
        { label: "English", key: "contentEn", value: contentEn },
        { label: "Chinese", key: "contentZh", value: contentZh },
      ].map(({ label, key, value }) => (
        <div key={label} className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{label}</p>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-graphite">Eyebrow
              <input value={value.eyebrow} onChange={(event) => updateAboutContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, eyebrow: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Hero title
              <input value={value.heroTitle} onChange={(event) => updateAboutContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, heroTitle: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Hero body
              <textarea value={value.heroBody} onChange={(event) => updateAboutContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, heroBody: event.target.value }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Paragraphs
              <textarea value={value.paragraphs.join("\n")} onChange={(event) => updateAboutContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, paragraphs: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) }))} className="min-h-32 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Visual label
              <input value={value.visualLabel} onChange={(event) => updateAboutContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, visualLabel: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
          </div>
        </div>
      ))}
    </section>
  );
}

function FitGuideStaticPageFields({
  content,
  contentEn,
  contentZh,
  updateFitGuideContent,
}: {
  content: AdminFitGuideStaticPageContent;
  contentEn: AdminFitGuideStaticPageContent;
  contentZh: AdminFitGuideStaticPageContent;
  updateFitGuideContent: (
    locale: "content" | "contentEn" | "contentZh",
    updater: (value: AdminFitGuideStaticPageContent) => AdminFitGuideStaticPageContent,
  ) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {[
        { label: "Base", key: "content", value: content },
        { label: "English", key: "contentEn", value: contentEn },
        { label: "Chinese", key: "contentZh", value: contentZh },
      ].map(({ label, key, value }) => (
        <div key={label} className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{label}</p>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-graphite">Eyebrow
              <input value={value.eyebrow} onChange={(event) => updateFitGuideContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, eyebrow: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Title
              <input value={value.title} onChange={(event) => updateFitGuideContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, title: event.target.value }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Body
              <textarea value={value.body} onChange={(event) => updateFitGuideContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, body: event.target.value }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-graphite">Cards
              <textarea value={value.cards.map((item) => item.title).join("\n")} onChange={(event) => updateFitGuideContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, cards: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean).map((title) => ({ title })) }))} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
            <div className="grid gap-2">
              <p className="text-sm font-bold text-graphite">Table headers</p>
              <div className="grid gap-3">
                <input value={value.headers.product} onChange={(event) => updateFitGuideContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, headers: { ...current.headers, product: event.target.value } }))} placeholder="Product" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
                <input value={value.headers.measure} onChange={(event) => updateFitGuideContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, headers: { ...current.headers, measure: event.target.value } }))} placeholder="Measure" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
                <input value={value.headers.fitCheck} onChange={(event) => updateFitGuideContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, headers: { ...current.headers, fitCheck: event.target.value } }))} placeholder="Fit check" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
              </div>
            </div>
            <label className="grid gap-2 text-sm font-bold text-graphite">Table rows
              <textarea value={value.rows.map((row) => `${row.product} | ${row.measure} | ${row.fitCheck}`).join("\n")} onChange={(event) => updateFitGuideContent(key as "content" | "contentEn" | "contentZh", (current) => ({ ...current, rows: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean).map((row) => { const [product = "", measure = "", fitCheck = ""] = row.split("|").map((part) => part.trim()); return { product, measure, fitCheck }; }) }))} className="min-h-40 rounded-2xl border border-graphite/10 px-4 py-3 text-sm font-normal outline-none" />
            </label>
          </div>
        </div>
      ))}
    </section>
  );
}
