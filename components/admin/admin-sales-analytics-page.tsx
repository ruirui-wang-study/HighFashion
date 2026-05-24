"use client";

import { useEffect, useState } from "react";
import { getAdminSalesAnalytics } from "@/lib/admin-api";
import type { AdminSalesAnalytics, AnalyticsRangeDays } from "@/lib/admin-analytics-types";
import { AdminBarChart, AdminChartPanel, AdminLineChart } from "./admin-chart-panel";
import { AdminKpiCard } from "./admin-kpi-card";
import { AdminPageHeader } from "./admin-page-header";
import { AdminRangeSwitcher } from "./admin-range-switcher";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function AdminSalesAnalyticsPageClient() {
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
        setError(nextError instanceof Error ? nextError.message : "Failed to load sales analytics");
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
      <AdminPageHeader eyebrow="Analytics" title="Sales" body="Sales performance is aggregated from the local PulseGear order database." />
      <div className="flex justify-end">
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">Loading sales analytics...</section> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <AdminKpiCard label="Revenue" value={formatCurrency(data.summary.gmvCents)} />
            <AdminKpiCard label="Orders" value={String(data.summary.orders)} />
            <AdminKpiCard label="AOV" value={formatCurrency(data.summary.aovCents)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <AdminChartPanel title="Revenue trend">
              <AdminLineChart values={data.trends.map((item) => item.revenueCents)} labels={data.trends.map((item) => item.date)} formatter={formatCurrency} />
            </AdminChartPanel>
            <AdminChartPanel title="Orders trend">
              <AdminLineChart values={data.trends.map((item) => item.orders)} labels={data.trends.map((item) => item.date)} formatter={(value) => `${value} orders`} />
            </AdminChartPanel>
            <AdminChartPanel title="AOV trend">
              <AdminLineChart values={data.trends.map((item) => item.aovCents)} labels={data.trends.map((item) => item.date)} formatter={formatCurrency} />
            </AdminChartPanel>
          </section>

          <AdminChartPanel title="Sales by country" body="Country distribution from order records.">
            <AdminBarChart
              rows={data.salesByCountry.map((item) => ({
                label: item.country,
                value: item.revenueCents,
                meta: `${item.orders} orders`,
              }))}
              formatter={formatCurrency}
            />
          </AdminChartPanel>
        </>
      ) : null}
    </div>
  );
}
