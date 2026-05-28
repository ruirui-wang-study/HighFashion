import { categoryToSlug } from "@/lib/category-routes";
import { getCanonicalUrl, siteName } from "@/lib/seo";
import type { Guide, Product } from "@/lib/types";
import type { FaqItem } from "@/data/faq";

type JsonLdNode = Record<string, unknown>;

function toOfferAvailability(stock: number) {
  if (stock <= 0) return "https://schema.org/OutOfStock";
  return "https://schema.org/InStock";
}

function toPrice(valueCents: number) {
  return (valueCents / 100).toFixed(2);
}

function buildOffer(product: Product, variant: Product["variants"][number]): JsonLdNode {
  return {
    "@type": "Offer",
    url: getCanonicalUrl(`/products/${product.slug}`),
    priceCurrency: "USD",
    price: toPrice(variant.priceCents),
    availability: toOfferAvailability(variant.stock),
    inventoryLevel: {
      "@type": "QuantitativeValue",
      value: variant.stock,
    },
    sku: variant.sku,
    itemCondition: "https://schema.org/NewCondition",
  };
}

export function buildProductStructuredData(product: Product): JsonLdNode {
  const activeVariants = product.variants.filter((variant) => variant.active);
  const sellableVariants = activeVariants.filter((variant) => variant.stock > 0);
  const variantsForPricing = sellableVariants.length > 0 ? sellableVariants : activeVariants;
  const prices = variantsForPricing.map((variant) => variant.priceCents);
  const hasSingleVariant = activeVariants.length === 1;

  const offers =
    hasSingleVariant && activeVariants[0]
      ? buildOffer(product, activeVariants[0])
      : {
          "@type": "AggregateOffer",
          url: getCanonicalUrl(`/products/${product.slug}`),
          priceCurrency: "USD",
          lowPrice: toPrice(Math.min(...prices)),
          highPrice: toPrice(Math.max(...prices)),
          offerCount: variantsForPricing.length,
          offers: variantsForPricing.map((variant) => buildOffer(product, variant)),
        };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? product.shortDescription,
    category: product.category,
    url: getCanonicalUrl(`/products/${product.slug}`),
    sku: hasSingleVariant && activeVariants[0] ? activeVariants[0].sku : undefined,
    offers,
    hasVariant: activeVariants.map((variant) => ({
      "@type": "Product",
      name: `${product.title} - ${variant.color} / ${variant.size}`,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      offers: buildOffer(product, variant),
    })),
  };
}

export function buildBreadcrumbStructuredData(items: Array<{ name: string; path: string }>): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path),
    })),
  };
}

export function buildProductBreadcrumbStructuredData(product: Product) {
  return buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: product.category, path: `/collections/${categoryToSlug(product.category)}` },
    { name: product.title, path: `/products/${product.slug}` },
  ]);
}

export function buildCategoryBreadcrumbStructuredData(category: string, slug: string) {
  return buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: category, path: `/collections/${slug}` },
  ]);
}

export function buildFaqStructuredData(items: FaqItem[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildGuideArticleStructuredData(guide: Guide): JsonLdNode {
  const articleBody = guide.sections.map((section) => `${section.heading}\n${section.body}`).join("\n\n");
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    articleSection: guide.category,
    articleBody,
    wordCount: articleBody.split(/\s+/).filter(Boolean).length,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: {
      "@type": "Person",
      name: guide.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: getCanonicalUrl("/"),
    },
    mainEntityOfPage: getCanonicalUrl(`/guides/${guide.slug}`),
    url: getCanonicalUrl(`/guides/${guide.slug}`),
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: getCanonicalUrl("/"),
    },
  };
}

export function buildGuideBreadcrumbStructuredData(guide: Guide) {
  return buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ]);
}
