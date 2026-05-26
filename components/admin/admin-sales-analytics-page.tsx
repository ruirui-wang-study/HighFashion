"use client";

import { useEffect, useState } from "react";
import { getAdminSalesAnalytics } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { AdminSalesAnalytics, AnalyticsRangeDays } from "@/lib/admin-analytics-types";
import { AdminBarChart, AdminChartPanel, AdminLineChart } from "./admin-chart-panel";
import { AdminKpiCard } from "./admin-kpi-card";
import { AdminPageHeader } from "./admin-page-header";
import { AdminRangeSwitcher } from "./admin-range-switcher";

function formatCurrency(cents: number, localeTag: string) {
  return new Intl.NumberFormat(localeTag, { style: "currency", currency: "USD" }).format(cents / 100);
}

export function AdminSalesAnalyticsPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const localeTag = zh ? "zh-CN" : "en-US";
  const [range, setRange] = useState<AnalyticsRangeDays>(7);
  const [data, setData] = useState<AdminSalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateRange(nextRange: AnalyticsRangeDays) {
    setLoading(true);
    setRange(nextRange);
  }

  useEffect(() => {
    let active = true;
    getAdminSalesAnalytics(range)
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载销售分析失败" : "Failed to load sales analytics");
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
      <AdminPageHeader eyebrow={zh ? "分析" : "Analytics"} title={zh ? "销售" : "Sales"} body={zh ? "销售表现基于本地 PulseGear 订单数据库聚合。" : "Sales performance is aggregated from the local PulseGear order database."} />
      <div className="flex justify-end">
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载销售分析..." : "Loading sales analytics..."}</section> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <AdminKpiCard label={zh ? "销售额" : "Revenue"} value={formatCurrency(data.summary.gmvCents, localeTag)} />
            <AdminKpiCard label={zh ? "订单数" : "Orders"} value={String(data.summary.orders)} />
            <AdminKpiCard label="AOV" value={formatCurrency(data.summary.aovCents, localeTag)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <AdminChartPanel title={zh ? "销售额趋势" : "Revenue trend"}>
              <AdminLineChart values={data.trends.map((item) => item.revenueCents)} labels={data.trends.map((item) => item.date)} formatter={(value) => formatCurrency(value, localeTag)} />
            </AdminChartPanel>
            <AdminChartPanel title={zh ? "订单趋势" : "Orders trend"}>
              <AdminLineChart values={data.trends.map((item) => item.orders)} labels={data.trends.map((item) => item.date)} formatter={(value) => zh ? `${value} 单` : `${value} orders`} />
            </AdminChartPanel>
            <AdminChartPanel title={zh ? "客单价趋势" : "AOV trend"}>
              <AdminLineChart values={data.trends.map((item) => item.aovCents)} labels={data.trends.map((item) => item.date)} formatter={(value) => formatCurrency(value, localeTag)} />
            </AdminChartPanel>
          </section>

          <AdminChartPanel title={zh ? "按国家销售" : "Sales by country"} body={zh ? "国家分布来自订单记录。" : "Country distribution from order records."}>
            <AdminBarChart
              rows={data.salesByCountry.map((item) => ({
                label: item.country,
                value: item.revenueCents,
                meta: zh ? `${item.orders} 单` : `${item.orders} orders`,
              }))}
              formatter={(value) => formatCurrency(value, localeTag)}
            />
          </AdminChartPanel>
        </>
      ) : null}
    </div>
  );
}
