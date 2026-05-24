"use client";

import { useEffect, useState } from "react";
import { getAdminSeoPages } from "@/lib/admin-api";
import type { AdminSeoPages, SearchConsoleRangeDays } from "@/lib/admin-seo-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminRangeSwitcher } from "./admin-range-switcher";
import { AdminSearchConsoleBadge } from "./admin-search-console-badge";
import { AdminSeoHealthScore } from "./admin-seo-health-score";
import { AdminSeoNav } from "./admin-seo-nav";
import { AdminTablePanel } from "./admin-table-panel";

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function AdminSeoPagesPageClient() {
  const [range, setRange] = useState<SearchConsoleRangeDays>(7);
  const [data, setData] = useState<AdminSeoPages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateRange(nextRange: SearchConsoleRangeDays) {
    setLoading(true);
    setRange(nextRange);
  }

  useEffect(() => {
    let active = true;
    getAdminSeoPages(range)
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load SEO pages");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range]);

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Growth" title="SEO Pages" body="Inspect page-level metadata, search metrics, and SEO health scores across managed public URLs." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminSeoNav />
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">Loading SEO pages...</section> : null}

      {!loading && data ? (
        <>
          <div className="flex justify-end">
            <AdminSearchConsoleBadge connection={data.searchConsole} />
          </div>
          <AdminTablePanel title="Page health and performance" body="Search Console metrics are mock fallback for now; metadata health is real and locally computed.">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">URL</th>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Canonical</th>
                  <th className="px-3 py-3">Index</th>
                  <th className="px-3 py-3">Clicks</th>
                  <th className="px-3 py-3">Impressions</th>
                  <th className="px-3 py-3">CTR</th>
                  <th className="px-3 py-3">Position</th>
                  <th className="px-3 py-3">Health</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.url} className="border-b border-graphite/5 align-top">
                    <td className="px-3 py-4 font-bold text-graphite">{row.url}</td>
                    <td className="px-3 py-4 text-muted">{row.title ?? "Missing"}</td>
                    <td className="px-3 py-4 text-muted">{row.description ?? "Missing"}</td>
                    <td className="px-3 py-4 text-muted">{row.canonical ?? "Missing"}</td>
                    <td className="px-3 py-4 text-muted">{row.indexStatus}</td>
                    <td className="px-3 py-4 text-muted">{row.clicks}</td>
                    <td className="px-3 py-4 text-muted">{row.impressions}</td>
                    <td className="px-3 py-4 text-muted">{formatPercent(row.ctr)}</td>
                    <td className="px-3 py-4 text-muted">{row.position.toFixed(1)}</td>
                    <td className="px-3 py-4">
                      <AdminSeoHealthScore score={row.healthScore} />
                      {row.issues.length > 0 ? <p className="mt-2 max-w-48 text-xs leading-5 text-muted">{row.issues.join(", ")}</p> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTablePanel>
        </>
      ) : null}
    </div>
  );
}
