"use client";

import { useEffect, useState } from "react";
import { getAdminSeoQueries } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { AdminSeoQueries, SearchConsoleRangeDays } from "@/lib/admin-seo-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminRangeSwitcher } from "./admin-range-switcher";
import { AdminSearchConsoleBadge } from "./admin-search-console-badge";
import { AdminSeoNav } from "./admin-seo-nav";
import { AdminTablePanel } from "./admin-table-panel";

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function AdminSeoQueriesPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [range, setRange] = useState<SearchConsoleRangeDays>(7);
  const [data, setData] = useState<AdminSeoQueries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateRange(nextRange: SearchConsoleRangeDays) {
    setLoading(true);
    setRange(nextRange);
  }

  useEffect(() => {
    let active = true;
    getAdminSeoQueries(range)
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载 SEO 查询失败" : "Failed to load SEO queries");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range, zh]);

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={zh ? "增长" : "Growth"} title={zh ? "SEO 查询" : "SEO Queries"} body={zh ? "查看自然搜索关键词、落地页和分段上下文表现。在 Search Console 仍为 fallback 时，页面结构保持不变。" : "Review top organic queries, landing pages, and segment context while Search Console remains on mock fallback."} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminSeoNav />
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载 SEO 查询..." : "Loading SEO queries..."}</section> : null}

      {!loading && data ? (
        <>
          <div className="flex justify-end">
            <AdminSearchConsoleBadge connection={data.searchConsole} />
          </div>
          <AdminTablePanel title={zh ? "查询表现" : "Query performance"} body={zh ? "这里已经按真实 Search Console 结构组织数据，后续替换 provider 时不需要改 UI。" : "Structured so a real Search Console adapter can replace the mock provider later without changing the UI."}>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{zh ? "查询词" : "Query"}</th>
                  <th className="px-3 py-3">{zh ? "点击" : "Clicks"}</th>
                  <th className="px-3 py-3">{zh ? "展示" : "Impressions"}</th>
                  <th className="px-3 py-3">CTR</th>
                  <th className="px-3 py-3">{zh ? "排名" : "Position"}</th>
                  <th className="px-3 py-3">{zh ? "落地页" : "Landing page"}</th>
                  <th className="px-3 py-3">{zh ? "国家" : "Country"}</th>
                  <th className="px-3 py-3">{zh ? "设备" : "Device"}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={`${row.query}-${row.country}-${row.device}`} className="border-b border-graphite/5">
                    <td className="px-3 py-4 font-bold text-graphite">{row.query}</td>
                    <td className="px-3 py-4 text-muted">{row.clicks}</td>
                    <td className="px-3 py-4 text-muted">{row.impressions}</td>
                    <td className="px-3 py-4 text-muted">{formatPercent(row.ctr)}</td>
                    <td className="px-3 py-4 text-muted">{row.position.toFixed(1)}</td>
                    <td className="px-3 py-4 text-muted">{row.landingPage}</td>
                    <td className="px-3 py-4 text-muted">{row.country}</td>
                    <td className="px-3 py-4 text-muted">{row.device}</td>
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
