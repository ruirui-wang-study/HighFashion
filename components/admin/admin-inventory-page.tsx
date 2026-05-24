"use client";

import { useEffect, useState } from "react";
import { adjustAdminInventory, getAdminInventory } from "@/lib/admin-api";
import type { AdminInventoryItem } from "@/lib/admin-types";
import { AdminPageHeader } from "./admin-page-header";
import { Button } from "@/components/ui/button";

const categories = ["Support", "Carry", "Hydration", "Socks", "Sweat", "Recovery"];

function inventoryTone(level: AdminInventoryItem["inventoryLevel"]) {
  if (level === "in_stock") return "bg-lime/20 text-graphite";
  if (level === "low_stock") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

export function AdminInventoryPageClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [items, setItems] = useState<AdminInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { quantityDelta: string; reason: string }>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  function updateFilter(setter: (value: string) => void, value: string) {
    setLoading(true);
    setter(value);
  }

  function load() {
    getAdminInventory({ search, category, stock })
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : "Failed to load inventory");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let active = true;
    getAdminInventory({ search, category, stock })
      .then((data) => {
        if (!active) return;
        setItems(data);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load inventory");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, category, stock]);

  async function submitAdjustment(item: AdminInventoryItem) {
    const draft = drafts[item.id];
    if (!draft) return;
    setPendingId(item.id);
    setError(null);
    try {
      await adjustAdminInventory({
        variantId: item.id,
        quantityDelta: Number(draft.quantityDelta),
        reason: draft.reason,
      });
      setDrafts((current) => ({ ...current, [item.id]: { quantityDelta: "", reason: "" } }));
      load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to adjust inventory");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Operations" title="Inventory" body="Monitor all active and inactive SKUs, filter low stock, and record manual stock corrections with a reason." />
      <section className="rounded-3xl bg-white p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <input value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} placeholder="Search SKU, product, color, size" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
          <select value={category} onChange={(event) => updateFilter(setCategory, event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={stock} onChange={(event) => updateFilter(setStock, event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
            <option value="">All stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
            <option value="in">In stock</option>
          </select>
        </div>
        {error ? <p className="mt-4 text-sm font-bold text-red-600">{error}</p> : null}
        {loading ? <p className="mt-6 text-sm text-muted">Loading inventory...</p> : null}
        {!loading ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3">Threshold</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Adjust</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-graphite/5 align-top">
                    <td className="px-3 py-4">
                      <p className="font-bold">{item.sku}</p>
                      <p className="mt-1 text-xs text-muted">{item.color} / {item.size}</p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-bold">{item.product.title}</p>
                      <p className="mt-1 text-xs text-muted">/{item.product.slug}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{item.product.category}</td>
                    <td className="px-3 py-4 text-muted">{item.stock}</td>
                    <td className="px-3 py-4 text-muted">{item.lowStockThreshold}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${inventoryTone(item.inventoryLevel)}`}>{item.inventoryLevel.replaceAll("_", " ")}</span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="grid gap-2 md:grid-cols-[7rem_1fr_auto]">
                        <input
                          type="number"
                          value={drafts[item.id]?.quantityDelta ?? ""}
                          onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { quantityDelta: event.target.value, reason: current[item.id]?.reason ?? "" } }))}
                          placeholder="+/- qty"
                          className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none"
                        />
                        <input
                          value={drafts[item.id]?.reason ?? ""}
                          onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { quantityDelta: current[item.id]?.quantityDelta ?? "", reason: event.target.value } }))}
                          placeholder="Reason"
                          className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={pendingId === item.id || !drafts[item.id]?.quantityDelta || !drafts[item.id]?.reason}
                          onClick={() => submitAdjustment(item)}
                        >
                          {pendingId === item.id ? "Saving" : "Apply"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items.length ? <p className="px-3 py-8 text-sm text-muted">No SKUs match the current filters.</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
