import { guides as fallbackGuides, getGuideBySlug as getFallbackGuideBySlug } from "@/data/guides";
import { faqs as fallbackFaqs } from "@/data/faq";
import { getManagedStaticPageByPathname } from "@/data/static-pages";
import { apiFetch } from "./api-client";
import { mapPublishedGuideToGuide, type PublishedCollectionLanding, type PublishedFaq, type PublishedGuide, type PublishedStaticPage } from "./content-types";
import type { Locale } from "./i18n";

export async function getPublishedGuides(locale: Locale = "en") {
  try {
    const guides = await apiFetch<PublishedGuide[]>(`/api/content/guides?locale=${locale}`);
    return guides.map(mapPublishedGuideToGuide);
  } catch {
    return fallbackGuides;
  }
}

export async function getPublishedGuideBySlug(slug: string, locale: Locale = "en") {
  try {
    const guide = await apiFetch<PublishedGuide | null>(`/api/content/guides/${slug}?locale=${locale}`);
    return guide ? mapPublishedGuideToGuide(guide) : null;
  } catch {
    return getFallbackGuideBySlug(slug) ?? null;
  }
}

export async function getPublishedFaq(locale: Locale = "en") {
  try {
    return await apiFetch<PublishedFaq>(`/api/content/faq?locale=${locale}`);
  } catch {
    return {
      title: locale === "zh" ? "常见问题" : "FAQ",
      seoTitle: locale === "zh" ? "常见问题 | PulseGear" : "FAQ | PulseGear",
      seoDescription: locale === "zh"
        ? "查看 PulseGear 关于配送、退货、尺码和结账的常见问题。"
        : "Frequently asked questions about PulseGear orders, shipping, and fit.",
      items: fallbackFaqs,
    } satisfies PublishedFaq;
  }
}

export async function getPublishedCollectionLanding(pathname: string, locale: Locale = "en") {
  try {
    return await apiFetch<PublishedCollectionLanding | null>(`/api/content/collections/by-path?pathname=${encodeURIComponent(pathname)}&locale=${locale}`);
  } catch {
    return null;
  }
}

export async function getPublishedStaticPage(pathname: string, locale: Locale = "en") {
  try {
    return await apiFetch<PublishedStaticPage | null>(`/api/content/static-pages/by-path?pathname=${encodeURIComponent(pathname)}&locale=${locale}`);
  } catch {
    const fallback = getManagedStaticPageByPathname(pathname);
    if (!fallback) return null;
    return {
      pageKey: fallback.pageKey,
      title: fallback.title,
      seoTitle: fallback.seoTitle,
      seoDescription: fallback.seoDescription,
      pathname: fallback.pathname,
      slug: fallback.slug,
      updatedAt: fallback.updatedAt,
      content: locale === "zh" ? (fallback.contentZh ?? fallback.content) : fallback.content,
    } as PublishedStaticPage;
  }
}
