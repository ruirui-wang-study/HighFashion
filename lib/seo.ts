import type { Metadata } from "next";
import { getPublicStorefrontSettings } from "./storefront-settings";

const fallbackSiteUrl = "http://localhost:3000";
const siteName = "PulseGear";
const defaultDescription = "PulseGear sells lightweight support, carry, hydration, and recovery essentials for running, training, and court sports.";

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.FRONTEND_URL ?? fallbackSiteUrl;
  return normalizeSiteUrl(value);
}

export async function getRuntimeSiteUrl() {
  const settings = await getPublicStorefrontSettings();
  return normalizeSiteUrl(settings.storefrontUrl || getSiteUrl());
}

export function getCanonicalUrl(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${normalizedPath === "/" ? "" : normalizedPath}`;
}

function resolveAbsoluteUrl(value?: string | null) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return getCanonicalUrl(value);
}

type MetadataInput = {
  title: string;
  description?: string;
  pathname: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonicalPathname?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
};

export function buildPageMetadata({
  title,
  description = defaultDescription,
  pathname,
  noIndex = false,
  noFollow = false,
  canonicalPathname,
  canonicalUrl,
  ogImageUrl,
}: MetadataInput): Metadata {
  const canonical = resolveAbsoluteUrl(canonicalUrl) ?? getCanonicalUrl(canonicalPathname ?? pathname);
  const resolvedOgImageUrl = resolveAbsoluteUrl(ogImageUrl);
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      ...(resolvedOgImageUrl ? { images: [{ url: resolvedOgImageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: !noFollow,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export function buildProductMetadata(input: {
  title: string;
  description: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
}) {
  return buildPageMetadata({
    title: input.seoTitle?.trim() || `${input.title} | PulseGear`,
    description: input.seoDescription?.trim() || input.description,
    pathname: `/products/${input.slug}`,
    canonicalUrl: input.canonicalUrl ?? undefined,
    ogImageUrl: input.ogImageUrl ?? undefined,
  });
}

export function buildCategoryMetadata(input: { category: string; slug: string }) {
  return buildPageMetadata({
    title: `${input.category} Gear | PulseGear`,
    description: `Shop ${input.category.toLowerCase()} gear from PulseGear for running, training, court sports, and recovery.`,
    pathname: `/collections/${input.slug}`,
  });
}

export function buildGuideMetadata(input: { title: string; description: string; slug?: string }) {
  return buildPageMetadata({
    title: input.slug ? `${input.title} | PulseGear Guides` : `${input.title} | PulseGear`,
    description: input.description,
    pathname: input.slug ? `/guides/${input.slug}` : "/guides",
  });
}

export { defaultDescription, siteName };

function normalizeSiteUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
