"use client";

import { useEffect, useState } from "react";
import { getAdminProductAnalytics } from "@/lib/admin-api";
import type { AdminProductAnalytics, AnalyticsRangeDays } from "@/lib/admin-analytics-types";
import { AdminBarChart, AdminChartPanel } from "./admin-chart-panel";
import { AdminKpiCard } from "./admin-kpi-card";
import { AdminPageHeader } from "./admin-page-header";
import { AdminRangeSwitcher } from "./admin-range-switcher";
import { AdminTablePanel } from "./admin-table-panel";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function AdminProductAnalyticsPageClient() {
  const [range, setRange] = useState<AnalyticsRangeDays>(7);
  const [data, setData] = useState<AdminProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateRange(nextRange: AnalyticsRangeDays) {
    setLoading(true);
    setRange(nextRange);
  }

  useEffect(() => {
    let active = true;
    getAdminProductAnalytics(range)
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load product analytics");
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
      <AdminPageHeader eyebrow="Analytics" title="Products" body="Product revenue and purchases are real; views and add to cart are mock fallback until GA4 is connected." />
      <div className="flex justify-end">
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">Loading product analytics...</section> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <AdminKpiCard label="Product views" value={String(data.summary.productViews)} hint="Mock fallback" />
            <AdminKpiCard label="Add to cart" value={String(data.summary.addToCart)} hint="Mock fallback" />
            <AdminKpiCard label="Purchases" value={String(data.summary.purchases)} hint="Paid and fulfilled orders" />
          </section>

          <AdminChartPanel title="Revenue by product" ga4={data.ga4} body="Commercial metrics use local orders; behavior metrics are mock-derived.">
            <AdminBarChart
              rows={data.revenueByProduct.map((item) => ({
                label: item.productTitle,
                value: item.revenueCents,
                meta: `${item.purchases} purchases / ${item.unitsSold} units`,
              }))}
              formatter={formatCurrency}
            />
          </AdminChartPanel>

          <AdminTablePanel title="Product performance" body="Per-product revenue and fallback engagement metrics.">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Views</th>
                  <th className="px-3 py-3">Add to cart</th>
                  <th className="px-3 py-3">Purchases</th>
                  <th className="px-3 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.revenueByProduct.map((item) => (
                  <tr key={item.productId} className="border-b border-graphite/5">
                    <td className="px-3 py-4 font-bold text-graphite">{item.productTitle}</td>
                    <td className="px-3 py-4 text-muted">{item.views}</td>
                    <td className="px-3 py-4 text-muted">{item.addToCart}</td>
                    <td className="px-3 py-4 text-muted">{item.purchases}</td>
                    <td className="px-3 py-4 text-muted">{formatCurrency(item.revenueCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.revenueByProduct.length ? <p className="px-3 py-8 text-sm text-muted">No product revenue in the selected range.</p> : null}
          </AdminTablePanel>
        </>
      ) : null}
    </div>
  );
}
