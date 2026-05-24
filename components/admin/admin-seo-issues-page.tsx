"use client";

import { useEffect, useMemo, useState } from "react";
import { bulkReviewSeoIssues, getSeoIssues } from "@/lib/admin-api";
import type { SeoIssueItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";
import { Button } from "@/components/ui/button";

export function AdminSeoIssuesPageClient() {
  const [items, setItems] = useState<SeoIssueItem[]>([]);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await getSeoIssues());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load issues");
    }
  }

  useEffect(() => {
    let active = true;
    getSeoIssues()
      .then((nextItems) => {
        if (!active) return;
        setItems(nextItems);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load issues");
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((item) => (status === "all" || item.status === status) && (priority === "all" || item.severity === priority) && (type === "all" || item.issueType === type)),
    [items, priority, status, type],
  );

  async function reviewSelected() {
    if (!selected.length) return;
    if (!window.confirm(`Mark ${selected.length} issues as reviewed?`)) return;
    await bulkReviewSeoIssues(selected);
    setSelected([]);
    await load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Growth" title="SEO Issues" body="Review page-level SEO problems discovered by the automation scan." />
      <AdminSeoNav />
      <FilterBar status={status} priority={priority} type={type} setStatus={setStatus} setPriority={setPriority} setType={setType} types={[...new Set(items.map((item) => item.issueType))]} />
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => void reviewSelected()} disabled={!selected.length}>
          Mark Reviewed
        </Button>
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3"></th>
              <th className="px-3 py-3">Page</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Health</th>
              <th className="px-3 py-3">Detected</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-graphite/5">
                <td className="px-3 py-4">
                  <input checked={selected.includes(item.id)} onChange={() => setSelected((current) => (current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]))} type="checkbox" />
                </td>
                <td className="px-3 py-4">
                  <p className="font-bold text-graphite">{item.pageUrl}</p>
                  <p className="text-xs text-muted">{item.message}</p>
                </td>
                <td className="px-3 py-4 text-muted">{item.issueType}</td>
                <td className="px-3 py-4 text-muted">{item.severity}</td>
                <td className="px-3 py-4 text-muted">{item.status}</td>
                <td className="px-3 py-4 text-muted">{item.healthScore}</td>
                <td className="px-3 py-4 text-muted">{new Date(item.detectedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function FilterBar({
  status,
  priority,
  type,
  setStatus,
  setPriority,
  setType,
  types,
}: {
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
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
        <option value="all">All status</option>
        <option value="OPEN">Open</option>
        <option value="REVIEWED">Reviewed</option>
      </select>
      <select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
        <option value="all">All priority</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
      </select>
      <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
        <option value="all">All type</option>
        {types.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </section>
  );
}
