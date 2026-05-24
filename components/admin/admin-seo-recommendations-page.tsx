"use client";

import { useEffect, useMemo, useState } from "react";
import { applySeoRecommendation, generateSeoRecommendations, getSeoRecommendations, rejectSeoRecommendation } from "@/lib/admin-api";
import type { SeoRecommendationItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";
import { Button } from "@/components/ui/button";

export function AdminSeoRecommendationsPageClient() {
  const [items, setItems] = useState<SeoRecommendationItem[]>([]);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [type, setType] = useState("all");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await getSeoRecommendations());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load recommendations");
    }
  }

  useEffect(() => {
    let active = true;
    getSeoRecommendations()
      .then((nextItems) => {
        if (!active) return;
        setItems(nextItems);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load recommendations");
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((item) => (status === "all" || item.status === status) && (priority === "all" || item.priority === priority) && (type === "all" || item.recommendationType === type)),
    [items, priority, status, type],
  );

  async function regenerate() {
    await generateSeoRecommendations();
    await load();
  }

  async function applyItem(id: string) {
    if (!window.confirm("Apply this recommendation to live admin data?")) return;
    await applySeoRecommendation(id);
    await load();
  }

  async function rejectItem(id: string) {
    if (!window.confirm("Reject this recommendation?")) return;
    await rejectSeoRecommendation(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Growth" title="SEO Recommendations" body="Review AI Draft recommendations before any SEO field is changed." />
      <AdminSeoNav />
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => void regenerate()}>Generate Recommendations</Button>
      </div>
      <FilterBar status={status} priority={priority} type={type} setStatus={setStatus} setPriority={setPriority} setType={setType} types={[...new Set(items.map((item) => item.recommendationType))]} />
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Resource</th>
              <th className="px-3 py-3">Reason</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Draft</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-graphite/5">
                <td className="px-3 py-4 font-bold text-graphite">{item.recommendationType}</td>
                <td className="px-3 py-4 text-muted">{item.pageUrl ?? `${item.resourceType}:${item.resourceId ?? "-"}`}</td>
                <td className="px-3 py-4 text-muted">{item.reason}</td>
                <td className="px-3 py-4 text-muted">{item.priority}</td>
                <td className="px-3 py-4 text-muted">{item.status}</td>
                <td className="px-3 py-4">
                  {item.isAiDraft ? <span className="rounded-full bg-warm px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-graphite">AI Draft</span> : null}
                </td>
                <td className="px-3 py-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => void applyItem(item.id)}>Apply</Button>
                    <Button variant="ghost" onClick={() => void rejectItem(item.id)}>Reject</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function FilterBar(props: {
  status: string;
  priority: string;
  type: string;
  setStatus: (value: string) => void;
  setPriority: (value: string) => void;
  setType: (value: string) => void;
  types: string[];
}) {
  return (
    <section className="grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-3">
      <select value={props.status} onChange={(event) => props.setStatus(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
        <option value="all">All status</option>
        <option value="DRAFT">Draft</option>
        <option value="APPLIED">Applied</option>
      </select>
      <select value={props.priority} onChange={(event) => props.setPriority(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
        <option value="all">All priority</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
      </select>
      <select value={props.type} onChange={(event) => props.setType(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
        <option value="all">All type</option>
        {props.types.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </section>
  );
}
