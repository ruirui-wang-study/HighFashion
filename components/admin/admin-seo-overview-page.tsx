"use client";

import { useEffect, useState } from "react";
import { getAdminSeoOverview } from "@/lib/admin-api";
import type { AdminSeoOverview, SearchConsoleRangeDays } from "@/lib/admin-seo-types";
import { AdminBarChart, AdminChartPanel } from "./admin-chart-panel";
import { AdminKpiCard } from "./admin-kpi-card";
import { AdminPageHeader } from "./admin-page-header";
import { AdminRangeSwitcher } from "./admin-range-switcher";
import { AdminSearchConsoleBadge } from "./admin-search-console-badge";
import { AdminSeoNav } from "./admin-seo-nav";
import { AdminSeoHealthScore } from "./admin-seo-health-score";
import { AdminTablePanel } from "./admin-table-panel";

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function AdminSeoOverviewPageClient() {
  const [range, setRange] = useState<SearchConsoleRangeDays>(7);
  const [data, setData] = useState<AdminSeoOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateRange(nextRange: SearchConsoleRangeDays) {
    setLoading(true);
    setRange(nextRange);
  }

  useEffect(() => {
    let active = true;
    getAdminSeoOverview(range)
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load SEO overview");
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
      <AdminPageHeader
        eyebrow="Growth"
        title="SEO Center"
        body="Monitor search visibility with Search Console-shaped metrics while local SEO health checks expose technical gaps on managed pages."
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminSeoNav />
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">Loading SEO overview...</section> : null}

      {!loading && data ? (
        <>
          <div className="flex justify-end">
            <AdminSearchConsoleBadge connection={data.searchConsole} />
          </div>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminKpiCard label="Organic clicks" value={String(data.summary.organicClicks)} />
            <AdminKpiCard label="Impressions" value={String(data.summary.impressions)} />
            <AdminKpiCard label="CTR" value={formatPercent(data.summary.ctr)} />
            <AdminKpiCard label="Average position" value={data.summary.averagePosition.toFixed(1)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <AdminChartPanel title="Top queries" ga4={undefined} body="Mock fallback until Search Console is connected.">
              <AdminBarChart
                rows={data.topQueries.map((item) => ({
                  label: item.query,
                  value: item.clicks,
                  meta: `${item.impressions} impressions / pos ${item.position}`,
                }))}
                formatter={(value) => `${value} clicks`}
              />
            </AdminChartPanel>

            <AdminChartPanel title="Health summary" body="Real local SEO health scoring based on titles, descriptions, canonicals, alt text, sitemap inclusion, and structured data.">
              <div className="space-y-4">
                <div className="rounded-2xl bg-warm p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Average health</p>
                  <div className="mt-3">
                    <AdminSeoHealthScore score={data.healthSummary.averageHealthScore} />
                  </div>
                </div>
                <div className="rounded-2xl bg-warm p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Pages below 80</p>
                  <p className="mt-3 font-display text-3xl font-black text-graphite">{data.healthSummary.pagesBelow80}</p>
                </div>
              </div>
            </AdminChartPanel>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <AdminTablePanel title="Top pages" body="Landing pages with the strongest organic visibility in the selected range.">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    <th className="px-3 py-3">Page</th>
                    <th className="px-3 py-3">Clicks</th>
                    <th className="px-3 py-3">CTR</th>
                    <th className="px-3 py-3">Position</th>
                    <th className="px-3 py-3">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((item) => (
                    <tr key={item.url} className="border-b border-graphite/5">
                      <td className="px-3 py-4 font-bold text-graphite">{item.url}</td>
                      <td className="px-3 py-4 text-muted">{item.clicks}</td>
                      <td className="px-3 py-4 text-muted">{formatPercent(item.ctr)}</td>
                      <td className="px-3 py-4 text-muted">{item.position.toFixed(1)}</td>
                      <td className="px-3 py-4"><AdminSeoHealthScore score={item.healthScore} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTablePanel>

            <AdminTablePanel title="Pages losing traffic" body="Mock delta view for pages whose clicks and impressions are trending down.">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    <th className="px-3 py-3">Page</th>
                    <th className="px-3 py-3">Clicks delta</th>
                    <th className="px-3 py-3">Impressions delta</th>
                    <th className="px-3 py-3">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pagesLosingTraffic.map((item) => (
                    <tr key={item.url} className="border-b border-graphite/5">
                      <td className="px-3 py-4 font-bold text-graphite">{item.url}</td>
                      <td className="px-3 py-4 text-red-700">{item.clicksDelta}</td>
                      <td className="px-3 py-4 text-red-700">{item.impressionsDelta}</td>
                      <td className="px-3 py-4"><AdminSeoHealthScore score={item.healthScore} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTablePanel>
          </section>
        </>
      ) : null}
    </div>
  );
}
