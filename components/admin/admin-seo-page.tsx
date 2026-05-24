"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAdminProducts } from "@/lib/admin-api";
import type { AdminProduct } from "@/lib/admin-types";
import { AdminPageHeader } from "./admin-page-header";
import { Button } from "@/components/ui/button";

type GapFilter = "all" | "missing-title" | "missing-description" | "missing-canonical" | "missing-og";

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function isComplete(product: AdminProduct) {
  return hasText(product.seoTitle)
    && hasText(product.seoDescription)
    && hasText(product.canonicalUrl)
    && hasText(product.ogImageUrl);
}

function matchesGapFilter(product: AdminProduct, gap: GapFilter) {
  if (gap === "all") return true;
  if (gap === "missing-title") return !hasText(product.seoTitle);
  if (gap === "missing-description") return !hasText(product.seoDescription);
  if (gap === "missing-canonical") return !hasText(product.canonicalUrl);
  return !hasText(product.ogImageUrl);
}

function statusTone(status: AdminProduct["status"]) {
  if (status === "ACTIVE") return "bg-lime/20 text-graphite";
  if (status === "DRAFT") return "bg-graphite/10 text-muted";
  return "bg-red-100 text-red-700";
}

function completionTone(complete: boolean) {
  return complete ? "bg-lime/20 text-graphite" : "bg-amber-100 text-amber-800";
}

export function AdminSeoPageClient() {
  const [status, setStatus] = useState("");
  const [gap, setGap] = useState<GapFilter>("all");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateStatus(value: string) {
    setLoading(true);
    setStatus(value);
  }

  useEffect(() => {
    let active = true;
    getAdminProducts(status ? { status } : {})
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load SEO data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status]);

  const filtered = useMemo(
    () => products.filter((product) => matchesGapFilter(product, gap)),
    [gap, products],
  );

  const summary = useMemo(
    () => ({
      products: products.length,
      complete: products.filter(isComplete).length,
      missingTitles: products.filter((product) => !hasText(product.seoTitle)).length,
      missingDescriptions: products.filter((product) => !hasText(product.seoDescription)).length,
      missingCanonicals: products.filter((product) => !hasText(product.canonicalUrl)).length,
      missingOgImages: products.filter((product) => !hasText(product.ogImageUrl)).length,
    }),
    [products],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Growth"
        title="SEO"
        body="Track product metadata coverage, find missing fields fast, and jump directly into the product editor before storefront pages go live."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Products tracked</p>
          <p className="mt-3 font-display text-4xl font-black">{summary.products}</p>
        </div>
        <div className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Complete metadata</p>
          <p className="mt-3 font-display text-4xl font-black">{summary.complete}</p>
        </div>
        <div className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Missing titles</p>
          <p className="mt-3 font-display text-4xl font-black">{summary.missingTitles}</p>
        </div>
        <div className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Missing descriptions</p>
          <p className="mt-3 font-display text-4xl font-black">{summary.missingDescriptions}</p>
        </div>
        <div className="rounded-3xl bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Missing canonicals / OG</p>
          <p className="mt-3 font-display text-4xl font-black">{summary.missingCanonicals + summary.missingOgImages}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_.9fr]">
        <div className="rounded-3xl bg-white p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={status}
              onChange={(event) => updateStatus(event.target.value)}
              className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
            >
              <option value="">All publishing states</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              value={gap}
              onChange={(event) => setGap(event.target.value as GapFilter)}
              className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
            >
              <option value="all">All products</option>
              <option value="missing-title">Missing SEO title</option>
              <option value="missing-description">Missing SEO description</option>
              <option value="missing-canonical">Missing canonical URL</option>
              <option value="missing-og">Missing OG image</option>
            </select>
          </div>

          {error ? <p className="mt-4 text-sm font-bold text-red-600">{error}</p> : null}
          {loading ? <p className="mt-6 text-sm text-muted">Loading SEO coverage...</p> : null}

          {!loading ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    <th className="px-3 py-3">Product</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Coverage</th>
                    <th className="px-3 py-3">Preview</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const complete = isComplete(product);
                    const previewTitle = product.seoTitle?.trim() || `${product.title} | PulseGear`;
                    const previewDescription = product.seoDescription?.trim() || product.shortDescription;
                    const previewCanonical = product.canonicalUrl?.trim() || `/products/${product.slug}`;

                    return (
                      <tr key={product.id} className="border-b border-graphite/5 align-top">
                        <td className="px-3 py-4">
                          <p className="font-bold text-graphite">{product.title}</p>
                          <p className="mt-1 text-xs text-muted">/{product.slug}</p>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${statusTone(product.status)}`}>{product.status}</span>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${completionTone(complete)}`}>{complete ? "Complete" : "Needs work"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-xs leading-6 text-muted">
                          <p>{hasText(product.seoTitle) ? "SEO title set" : "Using fallback title"}</p>
                          <p>{hasText(product.seoDescription) ? "SEO description set" : "Using short description"}</p>
                          <p>{hasText(product.canonicalUrl) ? "Canonical set" : "Using default product URL"}</p>
                          <p>{hasText(product.ogImageUrl) ? "OG image set" : "No OG override"}</p>
                        </td>
                        <td className="px-3 py-4">
                          <p className="font-bold text-graphite">{previewTitle}</p>
                          <p className="mt-2 max-w-md text-xs leading-5 text-muted">{previewDescription}</p>
                          <p className="mt-2 text-xs text-signal">{previewCanonical}</p>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <Button asChild variant="ghost">
                            <Link href={`/admin/products/${product.id}`}>Edit SEO</Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filtered.length ? <p className="px-3 py-8 text-sm text-muted">No products match the current SEO filters.</p> : null}
            </div>
          ) : null}
        </div>

        <section className="space-y-4">
          <div className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">SEO guardrails</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
              <li>- Product pages should resolve to `/products/{'{slug}'}`.</li>
              <li>- Canonicals should point to the approved public product URL.</li>
              <li>- Draft, archived, cart, checkout, account, and admin pages should stay out of search.</li>
              <li>- Only visible on-page FAQ content should use `FAQPage` structured data.</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Priority queue</p>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <div className="rounded-2xl bg-warm p-4">
                <p className="font-bold text-graphite">Missing descriptions</p>
                <p className="mt-1">{summary.missingDescriptions} products need custom search snippets.</p>
              </div>
              <div className="rounded-2xl bg-warm p-4">
                <p className="font-bold text-graphite">Missing canonicals</p>
                <p className="mt-1">{summary.missingCanonicals} products are still relying on default canonical generation.</p>
              </div>
              <div className="rounded-2xl bg-warm p-4">
                <p className="font-bold text-graphite">Missing OG overrides</p>
                <p className="mt-1">{summary.missingOgImages} products have no dedicated social share image.</p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
