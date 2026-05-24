"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { applyAdminProductSeoDraft, createAdminProduct, generateAdminProductSeoDraft, getAdminProduct, updateAdminProduct } from "@/lib/admin-api";
import type { AdminProduct, AdminProductPayload } from "@/lib/admin-types";
import type { ProductSeoDraft } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { Button } from "@/components/ui/button";

const categories = ["Support", "Carry", "Hydration", "Socks", "Sweat", "Recovery"];
const useCaseOptions = ["Run", "Train", "Court", "Recovery"];
const tabs = ["Basic Info", "Variants", "Images", "SEO", "Publishing"] as const;

type TabKey = (typeof tabs)[number];

function defaultPayload(): AdminProductPayload {
  return {
    title: "",
    slug: "",
    category: "Support",
    shortDescription: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    ogImageUrl: "",
    badge: "",
    benefits: [""],
    features: [""],
    useCases: ["Run"],
    bundleEligible: false,
    status: "DRAFT",
    images: [{ url: "", alt: "", sortOrder: 0 }],
    variants: [
      {
        sku: "",
        color: "Graphite",
        size: "M",
        priceCents: 0,
        compareAtPriceCents: null,
        stock: 0,
        lowStockThreshold: 5,
        weightGrams: 220,
        active: true,
      },
    ],
  };
}

function fromProduct(product: AdminProduct): AdminProductPayload {
  return {
    title: product.title,
    slug: product.slug,
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    canonicalUrl: product.canonicalUrl ?? "",
    ogImageUrl: product.ogImageUrl ?? "",
    badge: product.badge ?? "",
    benefits: product.benefits.length ? product.benefits : [""],
    features: product.features.length ? product.features : [""],
    useCases: product.useCases.length ? product.useCases : ["Run"],
    bundleEligible: product.bundleEligible,
    status: product.status,
    images: product.images.length ? product.images : [{ url: "", alt: "", sortOrder: 0 }],
    variants: product.variants.length
      ? product.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          priceCents: variant.priceCents,
          compareAtPriceCents: variant.compareAtPriceCents ?? null,
          stock: variant.stock,
          lowStockThreshold: variant.lowStockThreshold,
          weightGrams: variant.weightGrams ?? null,
          active: variant.active,
        }))
      : defaultPayload().variants,
  };
}

function parseLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function linesValue(value: string[]) {
  return value.join("\n");
}

export function AdminProductEditor({ product, productId }: { product?: AdminProduct; productId?: string }) {
  const isEditing = Boolean(product || productId);
  const [tab, setTab] = useState<TabKey>("Basic Info");
  const [form, setForm] = useState<AdminProductPayload>(() => (product ? fromProduct(product) : defaultPayload()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState(product?.id ?? null);
  const [loading, setLoading] = useState(Boolean(productId && !product));
  const [seoDraft, setSeoDraft] = useState<ProductSeoDraft | null>(null);
  const [seoDraftLoading, setSeoDraftLoading] = useState(false);

  useEffect(() => {
    if (!productId || product) return;
    let active = true;
    getAdminProduct(productId)
      .then((data) => {
        if (!active) return;
        setSavedId(data.id);
        setForm(fromProduct(data));
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load product");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [product, productId]);

  const totalStock = useMemo(() => form.variants.filter((variant) => variant.active).reduce((sum, variant) => sum + variant.stock, 0), [form.variants]);

  function patch<K extends keyof AdminProductPayload>(key: K, value: AdminProductPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function patchVariant(index: number, key: keyof AdminProductPayload["variants"][number], value: string | number | boolean | null) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => (variantIndex === index ? { ...variant, [key]: value } : variant)),
    }));
  }

  function patchImage(index: number, key: keyof AdminProductPayload["images"][number], value: string | number | undefined) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => (imageIndex === index ? { ...image, [key]: value } : image)),
    }));
  }

  function removeImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index).map((image, imageIndex) => ({ ...image, sortOrder: imageIndex })),
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: AdminProductPayload = {
        ...form,
        badge: form.badge?.trim() || null,
        seoTitle: form.seoTitle?.trim() || null,
        seoDescription: form.seoDescription?.trim() || null,
        canonicalUrl: form.canonicalUrl?.trim() || null,
        ogImageUrl: form.ogImageUrl?.trim() || null,
        benefits: parseLines(linesValue(form.benefits)),
        features: parseLines(linesValue(form.features)),
        images: form.images
          .map((image, index) => ({ ...image, sortOrder: image.sortOrder ?? index }))
          .filter((image) => image.url.trim() && image.alt.trim()),
        variants: form.variants.map((variant) => ({
          ...variant,
          compareAtPriceCents: variant.compareAtPriceCents || null,
          weightGrams: variant.weightGrams || null,
        })),
      };

      const saved = savedId ? await updateAdminProduct(savedId, payload) : await createAdminProduct(payload);
      setSavedId(saved.id);
      setForm(fromProduct(saved));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  async function onGenerateSeoDraft() {
    if (!savedId) {
      setError("Save the product before generating SEO drafts");
      return;
    }
    setSeoDraftLoading(true);
    setError(null);
    try {
      setSeoDraft(await generateAdminProductSeoDraft(savedId));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to generate SEO draft");
    } finally {
      setSeoDraftLoading(false);
    }
  }

  async function onApplySeoDraft() {
    if (!savedId || !seoDraft) return;
    if (!window.confirm("Apply this AI Draft to product SEO fields?")) return;
    setSeoDraftLoading(true);
    setError(null);
    try {
      const updated = await applyAdminProductSeoDraft(savedId, seoDraft);
      setForm(fromProduct(updated));
      setSeoDraft(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to apply SEO draft");
    } finally {
      setSeoDraftLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title={isEditing ? "Edit product" : "New product"}
        body="Build product basics, configure variants, and manage stock thresholds without touching the storefront code."
        action={savedId ? { href: "/admin/products", label: "Back to products" } : undefined}
      />

      <section className="rounded-3xl bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] ${tab === item ? "bg-graphite text-white" : "bg-warm text-muted"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">Loading product...</section> : null}

      {!loading && tab === "Basic Info" ? (
        <section className="grid gap-6 rounded-3xl bg-white p-6 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Title</span>
            <input value={form.title} onChange={(event) => patch("title", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" required />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Slug</span>
            <input value={form.slug} onChange={(event) => patch("slug", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" required />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Category</span>
            <select value={form.category} onChange={(event) => patch("category", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Badge</span>
            <input value={form.badge ?? ""} onChange={(event) => patch("badge", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" />
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Short description</span>
            <textarea value={form.shortDescription} onChange={(event) => patch("shortDescription", event.target.value)} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 outline-none" required />
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Description</span>
            <textarea value={form.description} onChange={(event) => patch("description", event.target.value)} className="min-h-32 rounded-2xl border border-graphite/10 px-4 py-3 outline-none" required />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Benefits</span>
            <textarea value={linesValue(form.benefits)} onChange={(event) => patch("benefits", parseLines(event.target.value))} className="min-h-32 rounded-2xl border border-graphite/10 px-4 py-3 outline-none" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Features</span>
            <textarea value={linesValue(form.features)} onChange={(event) => patch("features", parseLines(event.target.value))} className="min-h-32 rounded-2xl border border-graphite/10 px-4 py-3 outline-none" />
          </label>
          <div className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Use cases</span>
            <div className="flex flex-wrap gap-2">
              {useCaseOptions.map((item) => {
                const active = form.useCases.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => patch("useCases", active ? form.useCases.filter((value) => value !== item) : [...form.useCases, item])}
                    className={`rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] ${active ? "bg-lime text-graphite" : "bg-warm text-muted"}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={form.bundleEligible} onChange={(event) => patch("bundleEligible", event.target.checked)} />
            <span className="text-sm font-bold text-graphite">Bundle eligible</span>
          </label>
        </section>
      ) : null}

      {!loading && tab === "Variants" ? (
        <section className="rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-signal">Inventory aware variants</p>
              <p className="mt-2 text-sm text-muted">Edit SKU, pricing, stock, threshold, and activation state. Stock changes are recorded as inventory adjustments.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                patch("variants", [
                  ...form.variants,
                  {
                    sku: "",
                    color: "Graphite",
                    size: "M",
                    priceCents: 0,
                    compareAtPriceCents: null,
                    stock: 0,
                    lowStockThreshold: 5,
                    weightGrams: 220,
                    active: true,
                  },
                ])
              }
            >
              Add variant
            </Button>
          </div>
          <div className="mt-6 space-y-4">
            {form.variants.map((variant, index) => (
              <div key={variant.id ?? `variant-${index}`} className="rounded-3xl border border-graphite/10 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">SKU</span><input value={variant.sku} onChange={(event) => patchVariant(index, "sku", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" required /></label>
                  <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Color</span><input value={variant.color} onChange={(event) => patchVariant(index, "color", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" required /></label>
                  <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Size</span><input value={variant.size} onChange={(event) => patchVariant(index, "size", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" required /></label>
                  <label className="flex items-center gap-3 pt-8"><input type="checkbox" checked={variant.active} onChange={(event) => patchVariant(index, "active", event.target.checked)} /><span className="text-sm font-bold">Active</span></label>
                  <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Price (cents)</span><input type="number" min="0" value={variant.priceCents} onChange={(event) => patchVariant(index, "priceCents", Number(event.target.value))} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></label>
                  <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Compare at (cents)</span><input type="number" min="0" value={variant.compareAtPriceCents ?? ""} onChange={(event) => patchVariant(index, "compareAtPriceCents", event.target.value ? Number(event.target.value) : null)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></label>
                  <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Stock</span><input type="number" min="0" value={variant.stock} onChange={(event) => patchVariant(index, "stock", Number(event.target.value))} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></label>
                  <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Low stock threshold</span><input type="number" min="0" value={variant.lowStockThreshold} onChange={(event) => patchVariant(index, "lowStockThreshold", Number(event.target.value))} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></label>
                  <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Weight (g)</span><input type="number" min="0" value={variant.weightGrams ?? ""} onChange={(event) => patchVariant(index, "weightGrams", event.target.value ? Number(event.target.value) : null)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" /></label>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">Active stock on hand: {totalStock} units</p>
        </section>
      ) : null}

      {!loading && tab === "Images" ? (
        <section className="rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-signal">Image URLs</p><p className="mt-2 text-sm text-muted">Provide remote or local image paths and keep alt text useful for merchandising and SEO.</p></div>
            <Button type="button" variant="ghost" onClick={() => patch("images", [...form.images, { url: "", alt: "", sortOrder: form.images.length }])}>Add image</Button>
          </div>
          <div className="mt-6 space-y-4">
            {form.images.map((image, index) => (
              <div key={image.id ?? `image-${index}`} className="grid gap-4 rounded-3xl border border-graphite/10 p-4 md:grid-cols-[7rem_1.2fr_.9fr_.45fr_auto] md:items-start">
                <div className="overflow-hidden rounded-2xl bg-warm">
                  {image.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt={image.alt || "Product image preview"} className="h-24 w-full object-cover" />
                  ) : (
                    <div className="grid h-24 place-items-center text-xs font-bold uppercase tracking-[0.12em] text-muted">Preview</div>
                  )}
                </div>
                <input value={image.url} onChange={(event) => patchImage(index, "url", event.target.value)} placeholder="https://..." className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" />
                <input value={image.alt} onChange={(event) => patchImage(index, "alt", event.target.value)} placeholder="Alt text" className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" />
                <input type="number" min="0" value={image.sortOrder} onChange={(event) => patchImage(index, "sortOrder", Number(event.target.value))} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" />
                <Button type="button" variant="ghost" onClick={() => removeImage(index)} disabled={form.images.length === 1}>Remove</Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && tab === "SEO" ? (
        <section className="grid gap-6 rounded-3xl bg-white p-6 lg:grid-cols-2">
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <Button type="button" variant="ghost" onClick={() => void onGenerateSeoDraft()} disabled={seoDraftLoading || !savedId}>
              {seoDraftLoading ? "Generating..." : "Generate SEO Draft"}
            </Button>
            <Button type="button" variant="lime" onClick={() => void onApplySeoDraft()} disabled={seoDraftLoading || !seoDraft}>
              Apply Draft
            </Button>
            {seoDraft ? <span className="rounded-full bg-warm px-3 py-3 text-xs font-bold uppercase tracking-[0.12em] text-graphite">AI Draft</span> : null}
          </div>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">SEO title</span>
            <input value={form.seoTitle ?? ""} onChange={(event) => patch("seoTitle", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" placeholder="Defaults to product title" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Canonical URL</span>
            <input value={form.canonicalUrl ?? ""} onChange={(event) => patch("canonicalUrl", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" placeholder="https://www.pulsegear.com/products/..." />
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">SEO description</span>
            <textarea value={form.seoDescription ?? ""} onChange={(event) => patch("seoDescription", event.target.value)} className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 outline-none" placeholder="Defaults to short description" />
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">OG image URL</span>
            <input value={form.ogImageUrl ?? ""} onChange={(event) => patch("ogImageUrl", event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none" placeholder="https://cdn.example.com/product-og.jpg" />
          </label>
          <div className="rounded-3xl bg-warm p-5 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Fallback behavior</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
              <li>- Empty SEO title falls back to the product title.</li>
              <li>- Empty SEO description falls back to the short description.</li>
              <li>- Empty canonical falls back to the storefront product URL.</li>
              <li>- Empty OG image falls back to the default product metadata without image override.</li>
            </ul>
          </div>
          {seoDraft ? (
            <div className="rounded-3xl border border-lime/30 bg-lime/10 p-5 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-graphite">AI Draft Preview</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-graphite">Manual Apply Required</span>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">SEO title</p>
                  <p className="mt-2 text-sm text-graphite">{seoDraft.seoTitle}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">SEO description</p>
                  <p className="mt-2 text-sm text-graphite">{seoDraft.seoDescription}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Image alt text</p>
                  <div className="mt-2 space-y-1 text-sm text-graphite">
                    {seoDraft.imageAltText.map((item) => <p key={item}>{item}</p>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Related guides</p>
                  <div className="mt-2 space-y-1 text-sm text-graphite">
                    {seoDraft.relatedGuides.map((item) => <p key={item}>{item}</p>)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {!loading && tab === "Publishing" ? (
        <section className="grid gap-6 rounded-3xl bg-white p-6 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Status</span>
            <select value={form.status} onChange={(event) => patch("status", event.target.value as AdminProductPayload["status"])} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <div className="rounded-3xl bg-warm p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Publishing notes</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
              <li>- Active products appear on storefront listing and detail pages.</li>
              <li>- Draft and archived products remain available in admin only.</li>
              <li>- Variant stock edits here create inventory movement records automatically.</li>
            </ul>
          </div>
        </section>
      ) : null}

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="lime" disabled={saving}>{saving ? "Saving" : isEditing ? "Save changes" : "Create product"}</Button>
        <Button asChild variant="ghost"><Link href="/admin/products">Cancel</Link></Button>
      </div>
    </form>
  );
}
