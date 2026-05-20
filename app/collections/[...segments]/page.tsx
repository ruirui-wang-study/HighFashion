import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { guides } from "@/data/guides";
import {
  baseCollectionPages,
  collectionLandingPages,
  getCollectionLandingPage,
  getRelatedGuidesForSlugs,
  hasCollectionFilterParams,
} from "@/data/collection-pages";
import { JsonLd } from "@/components/seo/json-ld";
import { CollectionSeoContent } from "@/components/collection-seo-content";
import { CollectionView } from "@/components/collection-view";
import { getProducts } from "@/lib/api-client";
import { slugToCategory } from "@/lib/category-routes";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbStructuredData, buildCategoryBreadcrumbStructuredData } from "@/lib/structured-data";
import { Container, Section, SectionHeader } from "@/components/ui/section";

type RouteParams = { segments: string[] };
type FilterParams = { sort?: string; price?: string; size?: string; color?: string };

export function generateStaticParams() {
  return [
    ...Object.keys(baseCollectionPages).map((slug) => ({ segments: [slug] })),
    ...collectionLandingPages.map((page) => ({ segments: [page.scenario, page.slug] })),
  ];
}

function resolveCollectionRoute(segments: string[]) {
  if (segments.length === 1) {
    const categorySlug = segments[0];
    const category = slugToCategory(categorySlug);
    const page = baseCollectionPages[categorySlug];
    if (!category || !page) return null;
    return {
      type: "base" as const,
      category,
      page,
      pathname: `/collections/${categorySlug}`,
    };
  }

  if (segments.length === 2) {
    const [scenario, slug] = segments;
    const page = getCollectionLandingPage(scenario, slug);
    if (!page) return null;
    return {
      type: "landing" as const,
      page,
      pathname: page.pathname,
    };
  }

  return null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<FilterParams>;
}): Promise<Metadata> {
  const { segments } = await params;
  const filters = await searchParams;
  const route = resolveCollectionRoute(segments);

  if (!route) {
    return {
      title: "Collection Not Found | PulseGear",
    };
  }

  return buildPageMetadata({
    title: route.page.title,
    description: route.page.description,
    pathname: route.pathname,
    canonicalPathname: route.pathname,
    noIndex: hasCollectionFilterParams(filters),
  });
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<FilterParams>;
}) {
  const { segments } = await params;
  const filters = await searchParams;
  const route = resolveCollectionRoute(segments);

  if (!route) notFound();

  const relatedGuides = getRelatedGuidesForSlugs(route.page.relatedGuideSlugs, guides);
  const relatedProducts = (
    await getProducts({
      category: route.type === "base" ? route.category : route.page.category,
      useCase: route.type === "landing" ? route.page.useCase : undefined,
    }).catch(() => [])
  ).slice(0, 3);

  const title = route.type === "base" ? `${route.category} gear` : route.page.title.replace(" | PulseGear", "");
  const body = route.type === "base" ? "Use filters to narrow by sport scenario, size, price, and color." : route.page.description;
  const breadcrumbData =
    route.type === "base"
      ? buildCategoryBreadcrumbStructuredData(route.category, route.page.slug)
      : buildBreadcrumbStructuredData([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: title, path: route.pathname },
        ]);

  return (
    <>
      <Section>
        <JsonLd data={breadcrumbData} />
        <Container>
          <SectionHeader eyebrow="Collection" title={title} body={body} />
          <CollectionView
            initialCategory={route.type === "base" ? route.category : route.page.category}
            initialUseCase={route.type === "landing" ? route.page.useCase : undefined}
            initialSize={filters.size}
            initialColor={filters.color}
            initialPrice={filters.price ? Number(filters.price) : undefined}
            initialSort={filters.sort}
            lockCategory={route.type === "base" || Boolean(route.page.category)}
            lockUseCase={route.type === "landing" && Boolean(route.page.useCase)}
          />
        </Container>
      </Section>
      <CollectionSeoContent intro={route.page.intro} relatedGuides={relatedGuides} relatedProducts={relatedProducts} />
    </>
  );
}
