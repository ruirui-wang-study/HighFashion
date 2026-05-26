"use client";

import { useEffect, useState } from "react";
import { getAdminFunnelAnalytics } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { AdminFunnelAnalytics, AnalyticsRangeDays } from "@/lib/admin-analytics-types";
import { AdminChartPanel, AdminFunnelChart } from "./admin-chart-panel";
import { AdminKpiCard } from "./admin-kpi-card";
import { AdminPageHeader } from "./admin-page-header";
import { AdminRangeSwitcher } from "./admin-range-switcher";
import { AdminTablePanel } from "./admin-table-panel";

export function AdminFunnelAnalyticsPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [range, setRange] = useState<AnalyticsRangeDays>(7);
  const [data, setData] = useState<AdminFunnelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateRange(nextRange: AnalyticsRangeDays) {
    setLoading(true);
    setRange(nextRange);
  }

  useEffect(() => {
    let active = true;
    getAdminFunnelAnalytics(range)
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载漏斗分析失败" : "Failed to load funnel analytics");
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
      <AdminPageHeader eyebrow={zh ? "分析" : "Analytics"} title={zh ? "漏斗" : "Funnel"} body={zh ? "非购买环节仍使用 fallback；购买数锚定本地已支付和已履约订单。" : "Non-purchase funnel steps use mock fallback; purchase count is anchored to local paid and fulfilled orders."} />
      <div className="flex justify-end">
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载漏斗分析..." : "Loading funnel analytics..."}</section> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            {data.steps.map((step) => (
              <AdminKpiCard key={step.key} label={step.label} value={String(step.value)} hint={zh ? `${Math.round(step.dropOffRate * 100)}% 流失` : `${Math.round(step.dropOffRate * 100)}% drop-off`} />
            ))}
          </section>

          <AdminChartPanel title={zh ? "漏斗推进" : "Funnel progression"} ga4={data.ga4} body={zh ? "即使 GA4 未连接，这张图也保持可用。" : "The chart stays usable even while GA4 is disconnected."}>
            <AdminFunnelChart steps={data.steps} />
          </AdminChartPanel>

          <AdminTablePanel title={zh ? "流失率" : "Drop-off rates"} body={zh ? "每个相邻漏斗阶段之间的相对流失。" : "Relative drop-off between each adjacent funnel stage."}>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{zh ? "步骤" : "Step"}</th>
                  <th className="px-3 py-3">{zh ? "数值" : "Value"}</th>
                  <th className="px-3 py-3">{zh ? "流失" : "Drop-off"}</th>
                </tr>
              </thead>
              <tbody>
                {data.steps.map((step) => (
                  <tr key={step.key} className="border-b border-graphite/5">
                    <td className="px-3 py-4 font-bold text-graphite">{step.label}</td>
                    <td className="px-3 py-4 text-muted">{step.value}</td>
                    <td className="px-3 py-4 text-muted">{Math.round(step.dropOffRate * 100)}%</td>
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
