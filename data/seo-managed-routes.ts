import { baseCollectionPages, collectionLandingPages } from "./collection-pages";
import { guides } from "./guides";
import { products } from "./products";
import { categorySlugs } from "../lib/category-routes";

export const staticSeoPages = [
  {
    url: "/",
    title: "PulseGear | Lightweight Support and Carry Essentials",
    description: "Shop lightweight support, no-bounce carry gear, hydration, and recovery essentials for running, training, and court sports.",
    canonical: "/",
    indexStatus: "indexable" as const,
    hasAltText: true,
    hasStructuredData: false,
  },
  {
    url: "/about",
    title: "About PulseGear",
    description: "Learn how PulseGear designs lightweight support, carry, hydration, and sweat-control essentials for repeat training days.",
    canonical: "/about",
    indexStatus: "indexable" as const,
    hasAltText: true,
    hasStructuredData: false,
  },
  {
    url: "/shop",
    title: "Shop Performance Utility Gear",
    description: "Browse PulseGear support, carry, hydration, socks, sweat-control, and recovery essentials.",
    canonical: "/shop",
    indexStatus: "indexable" as const,
    hasAltText: true,
    hasStructuredData: false,
  },
  {
    url: "/faq",
    title: "FAQ, Shipping, and Returns",
    description: "Review PulseGear shipping, returns, fit, and checkout answers before placing an order.",
    canonical: "/faq",
    indexStatus: "indexable" as const,
    hasAltText: true,
    hasStructuredData: true,
  },
  {
    url: "/fit-guide",
    title: "Fit Guide",
    description: "Use the PulseGear fit guide to choose support, carry, and sock sizes by measurement and movement.",
    canonical: "/fit-guide",
    indexStatus: "indexable" as const,
    hasAltText: true,
    hasStructuredData: false,
  },
  {
    url: "/guides",
    title: "Training Guides | PulseGear",
    description: "Practical PulseGear guides for choosing knee support, summer run carry, and court sport essentials.",
    canonical: "/guides",
    indexStatus: "indexable" as const,
    hasAltText: true,
    hasStructuredData: false,
  },
] as const;

export function getManagedSitemapPaths() {
  return [
    ...staticSeoPages.map((page) => page.url),
    ...products.map((product) => `/products/${product.slug}`),
    ...Object.values(categorySlugs).map((slug) => `/collections/${slug}`),
    ...collectionLandingPages.map((page) => page.pathname),
    ...guides.map((guide) => `/guides/${guide.slug}`),
  ];
}

export function getManagedCollectionPages() {
  return Object.values(categorySlugs).map((slug) => {
    const page = baseCollectionPages[slug];
    return {
      url: `/collections/${slug}`,
      title: page.title,
      description: page.description,
      canonical: `/collections/${slug}`,
      indexStatus: "indexable" as const,
      hasAltText: true,
      hasStructuredData: true,
    };
  });
}

export function getManagedCollectionLandingPages() {
  return collectionLandingPages.map((page) => ({
    url: page.pathname,
    title: page.title,
    description: page.description,
    canonical: page.pathname,
    indexStatus: "indexable" as const,
    hasAltText: true,
    hasStructuredData: true,
  }));
}

export function getManagedGuidePages() {
  return guides.map((guide) => ({
    url: `/guides/${guide.slug}`,
    title: guide.metaTitle,
    description: guide.metaDescription,
    canonical: `/guides/${guide.slug}`,
    indexStatus: "indexable" as const,
    hasAltText: true,
    hasStructuredData: true,
  }));
}
