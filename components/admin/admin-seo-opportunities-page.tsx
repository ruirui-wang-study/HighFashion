"use client";

import { useEffect, useMemo, useState } from "react";
import { createSeoContentBrief, generateSeoOpportunities, getSeoOpportunities } from "@/lib/admin-api";
import type { ContentOpportunityItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";
import { Button } from "@/components/ui/button";

export function AdminSeoOpportunitiesPageClient() {
  const [items, setItems] = useState<ContentOpportunityItem[]>([]);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [type, setType] = useState("all");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await getSeoOpportunities());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load opportunities");
    }
  }

  useEffect(() => {
    let active = true;
    getSeoOpportunities()
      .then((nextItems) => {
        if (!active) return;
        setItems(nextItems);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load opportunities");
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((item) => (status === "all" || item.status === status) && (priority === "all" || item.priority === priority) && (type === "all" || item.opportunityType === type)),
    [items, priority, status, type],
  );

  async function regenerate() {
    await generateSeoOpportunities();
    await load();
  }

  async function createBrief(id: string) {
    if (!window.confirm("Create a content brief from this opportunity?")) return;
    await createSeoContentBrief(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Growth" title="Keyword Opportunities" body="Prioritize high-potential queries and pages before creating new content or rewriting metadata." />
      <AdminSeoNav />
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => void regenerate()}>Generate Opportunities</Button>
      </div>
      <FilterBar status={status} priority={priority} type={type} setStatus={setStatus} setPriority={setPriority} setType={setType} types={[...new Set(items.map((item) => item.opportunityType))]} />
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Keyword</th>
              <th className="px-3 py-3">Current Page</th>
              <th className="px-3 py-3">Suggested Action</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-graphite/5">
                <td className="px-3 py-4 font-bold text-graphite">{item.opportunityType}</td>
                <td className="px-3 py-4 text-muted">{item.keyword ?? "-"}</td>
                <td className="px-3 py-4 text-muted">{item.currentPage ?? "-"}</td>
                <td className="px-3 py-4 text-muted">{item.suggestedAction}</td>
                <td className="px-3 py-4 text-muted">{item.priority}</td>
                <td className="px-3 py-4 text-muted">{item.status}</td>
                <td className="px-3 py-4">
                  <Button variant="ghost" onClick={() => void createBrief(item.id)}>Create Brief</Button>
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
        <option value="NEW">New</option>
        <option value="DONE">Done</option>
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
