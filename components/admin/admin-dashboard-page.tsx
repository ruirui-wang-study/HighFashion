"use client";

import { useEffect, useState } from "react";
import { getAdminDashboardAnalytics } from "@/lib/admin-api";
import type { AdminDashboardAnalytics, AnalyticsRangeDays } from "@/lib/admin-analytics-types";
import { AdminBarChart, AdminChartPanel } from "./admin-chart-panel";
import { AdminKpiCard } from "./admin-kpi-card";
import { AdminPageHeader } from "./admin-page-header";
import { AdminRangeSwitcher } from "./admin-range-switcher";
import { AdminTablePanel } from "./admin-table-panel";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function AdminDashboardPageClient() {
  const [range, setRange] = useState<AnalyticsRangeDays>(7);
  const [data, setData] = useState<AdminDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateRange(nextRange: AnalyticsRangeDays) {
    setLoading(true);
    setRange(nextRange);
  }

  useEffect(() => {
    let active = true;
    getAdminDashboardAnalytics(range)
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load dashboard analytics");
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
        eyebrow="Operations"
        title="Dashboard"
        body="Track real order-driven commerce performance while behavioral metrics stay on mock fallback until GA4 is connected."
      />

      <div className="flex justify-end">
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">Loading dashboard analytics...</section> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminKpiCard label="GMV" value={formatCurrency(data.summary.gmvCents)} hint={`${range} day sales total`} />
            <AdminKpiCard label="Orders" value={String(data.summary.orders)} hint="Paid and fulfilled orders" />
            <AdminKpiCard label="AOV" value={formatCurrency(data.summary.aovCents)} hint="Average order value" />
            <AdminKpiCard label="Conversion" value={formatPercent(data.summary.conversionRate)} hint="Sessions are mock fallback" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <AdminChartPanel title="Top products" body="Ranked by revenue, then units sold.">
              <AdminBarChart
                rows={data.topProducts.map((item) => ({
                  label: item.productTitle,
                  value: item.revenueCents,
                  meta: `${item.unitsSold} units / ${item.purchases} purchases`,
                }))}
                formatter={formatCurrency}
              />
            </AdminChartPanel>

            <AdminChartPanel title="Low stock alerts" body="Active variants at or below their low stock threshold.">
              <div className="space-y-3">
                {data.lowStockAlerts.length === 0 ? <div className="rounded-2xl bg-warm p-6 text-sm text-muted">No low stock alerts right now.</div> : null}
                {data.lowStockAlerts.map((alert) => (
                  <div key={alert.variantId} className="rounded-2xl bg-warm p-4">
                    <p className="font-bold text-graphite">{alert.product.title}</p>
                    <p className="mt-1 text-xs text-muted">{alert.sku}</p>
                    <p className="mt-3 text-sm text-graphite">Stock {alert.stock} / Threshold {alert.lowStockThreshold}</p>
                  </div>
                ))}
              </div>
            </AdminChartPanel>
          </section>

          <AdminTablePanel title="Recent orders" body="Latest paid and fulfilled orders in the selected window.">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">Order</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Country</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.orderId} className="border-b border-graphite/5">
                    <td className="px-3 py-4 font-bold text-graphite">{order.orderNo}</td>
                    <td className="px-3 py-4 text-muted">{order.status}</td>
                    <td className="px-3 py-4 text-muted">{order.customerCountry ?? "Unknown"}</td>
                    <td className="px-3 py-4 text-muted">{formatCurrency(order.totalCents)}</td>
                    <td className="px-3 py-4 text-muted">{new Date(order.createdAt).toLocaleDateString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.recentOrders.length ? <p className="px-3 py-8 text-sm text-muted">No recent orders in the selected range.</p> : null}
          </AdminTablePanel>
        </>
      ) : null}
    </div>
  );
}
