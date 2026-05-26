"use client";

import { useEffect, useState } from "react";
import { getAdminDashboardAnalytics } from "@/lib/admin-api";
import type { AdminDashboardAnalytics, AnalyticsRangeDays } from "@/lib/admin-analytics-types";
import { useLocale } from "@/components/locale-provider";
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
  const { messages } = useLocale();
  const copy = messages.admin.dashboard;
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
        setError(nextError instanceof Error ? nextError.message : copy.loadFailed);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range, copy.loadFailed]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        body={copy.body}
      />

      <div className="flex justify-end">
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{copy.loading}</section> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminKpiCard label={copy.kpis.gmv} value={formatCurrency(data.summary.gmvCents)} hint={`${range} ${copy.kpis.salesTotal}`} />
            <AdminKpiCard label={copy.kpis.orders} value={String(data.summary.orders)} hint={copy.kpis.paidFulfilled} />
            <AdminKpiCard label={copy.kpis.aov} value={formatCurrency(data.summary.aovCents)} hint={copy.kpis.averageOrderValue} />
            <AdminKpiCard label={copy.kpis.conversion} value={formatPercent(data.summary.conversionRate)} hint={copy.kpis.sessionsFallback} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <AdminChartPanel title={copy.topProducts} body={copy.topProductsBody}>
              <AdminBarChart
                rows={data.topProducts.map((item) => ({
                  label: item.productTitle,
                  value: item.revenueCents,
                  meta: `${item.unitsSold} units / ${item.purchases} purchases`,
                }))}
                formatter={formatCurrency}
              />
            </AdminChartPanel>

            <AdminChartPanel title={copy.lowStockAlerts} body={copy.lowStockAlertsBody}>
              <div className="space-y-3">
                {data.lowStockAlerts.length === 0 ? <div className="rounded-2xl bg-warm p-6 text-sm text-muted">{copy.noLowStockAlerts}</div> : null}
                {data.lowStockAlerts.map((alert) => (
                  <div key={alert.variantId} className="rounded-2xl bg-warm p-4">
                    <p className="font-bold text-graphite">{alert.product.title}</p>
                    <p className="mt-1 text-xs text-muted">{alert.sku}</p>
                    <p className="mt-3 text-sm text-graphite">{copy.stockLine.replace("{stock}", String(alert.stock)).replace("{threshold}", String(alert.lowStockThreshold))}</p>
                  </div>
                ))}
              </div>
            </AdminChartPanel>
          </section>

          <AdminTablePanel title={copy.recentOrders} body={copy.recentOrdersBody}>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{copy.table.order}</th>
                  <th className="px-3 py-3">{copy.table.status}</th>
                  <th className="px-3 py-3">{copy.table.country}</th>
                  <th className="px-3 py-3">{copy.table.total}</th>
                  <th className="px-3 py-3">{copy.table.created}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.orderId} className="border-b border-graphite/5">
                    <td className="px-3 py-4 font-bold text-graphite">{order.orderNo}</td>
                    <td className="px-3 py-4 text-muted">{order.status}</td>
                    <td className="px-3 py-4 text-muted">{order.customerCountry ?? messages.admin.common.unknown}</td>
                    <td className="px-3 py-4 text-muted">{formatCurrency(order.totalCents)}</td>
                    <td className="px-3 py-4 text-muted">{new Date(order.createdAt).toLocaleDateString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.recentOrders.length ? <p className="px-3 py-8 text-sm text-muted">{copy.noRecentOrders}</p> : null}
          </AdminTablePanel>
        </>
      ) : null}
    </div>
  );
}
