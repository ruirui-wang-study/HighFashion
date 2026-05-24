"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAdminProducts } from "@/lib/admin-api";
import type { AdminProduct } from "@/lib/admin-types";
import { AdminPageHeader } from "./admin-page-header";
import { Button } from "@/components/ui/button";

const categories = ["Support", "Carry", "Hydration", "Socks", "Sweat", "Recovery"];

function statusTone(status: AdminProduct["status"]) {
  if (status === "ACTIVE") return "bg-lime/20 text-graphite";
  if (status === "DRAFT") return "bg-graphite/10 text-muted";
  return "bg-red-100 text-red-700";
}

export function AdminProductsPageClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateFilter(setter: (value: string) => void, value: string) {
    setLoading(true);
    setter(value);
  }

  useEffect(() => {
    let active = true;
    getAdminProducts({ search, status, category, stock })
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load products");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, status, category, stock]);

  const summary = useMemo(
    () => ({
      products: products.length,
      variants: products.reduce((sum, product) => sum + product.variants.length, 0),
      stock: products.reduce((sum, product) => sum + product.inventorySummary.totalStock, 0),
    }),
    [products],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        body="Manage catalog status, variant mix, pricing, and inventory from one admin surface."
        action={{ href: "/admin/products/new", label: "New product" }}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Products</p><p className="mt-3 font-display text-4xl font-black">{summary.products}</p></div>
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Variants</p><p className="mt-3 font-display text-4xl font-black">{summary.variants}</p></div>
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Units on hand</p><p className="mt-3 font-display text-4xl font-black">{summary.stock}</p></div>
      </section>

      <section className="rounded-3xl bg-white p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} placeholder="Search title, slug, SKU" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
          <select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
            <option value="">All status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select value={category} onChange={(event) => updateFilter(setCategory, event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={stock} onChange={(event) => updateFilter(setStock, event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
            <option value="">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>

        {error ? <p className="mt-4 text-sm font-bold text-red-600">{error}</p> : null}
        {loading ? <p className="mt-6 text-sm text-muted">Loading products...</p> : null}

        {!loading ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Variants</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3">Updated</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-graphite/5 align-top">
                    <td className="px-3 py-4">
                      <p className="font-bold text-graphite">{product.title}</p>
                      <p className="mt-1 text-xs text-muted">/{product.slug}</p>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${statusTone(product.status)}`}>{product.status}</span>
                    </td>
                    <td className="px-3 py-4 text-muted">{product.category}</td>
                    <td className="px-3 py-4 text-muted">{product.variants.length}</td>
                    <td className="px-3 py-4 text-muted">
                      <p>{product.inventorySummary.totalStock} units</p>
                      <p className="mt-1 text-xs">{product.inventorySummary.lowStockVariants} low / {product.inventorySummary.outOfStockVariants} out</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{new Date(product.updatedAt).toLocaleDateString("en-US")}</td>
                    <td className="px-3 py-4 text-right">
                      <Button asChild variant="ghost"><Link href={`/admin/products/${product.id}`}>Edit</Link></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!products.length ? <p className="px-3 py-8 text-sm text-muted">No products match the current filters.</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
