"use client";

import { useEffect, useState } from "react";
import { getAdminProductAnalytics } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { AdminProductAnalytics, AnalyticsRangeDays } from "@/lib/admin-analytics-types";
import { AdminBarChart, AdminChartPanel } from "./admin-chart-panel";
import { AdminKpiCard } from "./admin-kpi-card";
import { AdminPageHeader } from "./admin-page-header";
import { AdminRangeSwitcher } from "./admin-range-switcher";
import { AdminTablePanel } from "./admin-table-panel";

function formatCurrency(cents: number, localeTag: string) {
  return new Intl.NumberFormat(localeTag, { style: "currency", currency: "USD" }).format(cents / 100);
}

export function AdminProductAnalyticsPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const localeTag = zh ? "zh-CN" : "en-US";
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
        setError(nextError instanceof Error ? nextError.message : zh ? "加载商品分析失败" : "Failed to load product analytics");
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
      <AdminPageHeader eyebrow={zh ? "分析" : "Analytics"} title={zh ? "商品" : "Products"} body={zh ? "商品收入和购买数是真实数据；浏览和加购在接入 GA4 前仍使用 fallback。" : "Product revenue and purchases are real; views and add to cart are mock fallback until GA4 is connected."} />
      <div className="flex justify-end">
        <AdminRangeSwitcher value={range} onChange={updateRange} />
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载商品分析..." : "Loading product analytics..."}</section> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <AdminKpiCard label={zh ? "商品浏览" : "Product views"} value={String(data.summary.productViews)} hint={zh ? "Fallback 数据" : "Mock fallback"} />
            <AdminKpiCard label={zh ? "加购" : "Add to cart"} value={String(data.summary.addToCart)} hint={zh ? "Fallback 数据" : "Mock fallback"} />
            <AdminKpiCard label={zh ? "购买数" : "Purchases"} value={String(data.summary.purchases)} hint={zh ? "已支付和已履约订单" : "Paid and fulfilled orders"} />
          </section>

          <AdminChartPanel title={zh ? "按商品销售额" : "Revenue by product"} ga4={data.ga4} body={zh ? "商业指标来自本地订单，行为指标仍使用 fallback。" : "Commercial metrics use local orders; behavior metrics are mock-derived."}>
            <AdminBarChart
              rows={data.revenueByProduct.map((item) => ({
                label: item.productTitle,
                value: item.revenueCents,
                meta: zh ? `${item.purchases} 次购买 / ${item.unitsSold} 件` : `${item.purchases} purchases / ${item.unitsSold} units`,
              }))}
              formatter={(value) => formatCurrency(value, localeTag)}
            />
          </AdminChartPanel>

          <AdminTablePanel title={zh ? "商品表现" : "Product performance"} body={zh ? "逐商品收入与 fallback 互动指标。" : "Per-product revenue and fallback engagement metrics."}>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{zh ? "商品" : "Product"}</th>
                  <th className="px-3 py-3">{zh ? "浏览" : "Views"}</th>
                  <th className="px-3 py-3">{zh ? "加购" : "Add to cart"}</th>
                  <th className="px-3 py-3">{zh ? "购买" : "Purchases"}</th>
                  <th className="px-3 py-3">{zh ? "销售额" : "Revenue"}</th>
                </tr>
              </thead>
              <tbody>
                {data.revenueByProduct.map((item) => (
                  <tr key={item.productId} className="border-b border-graphite/5">
                    <td className="px-3 py-4 font-bold text-graphite">{item.productTitle}</td>
                    <td className="px-3 py-4 text-muted">{item.views}</td>
                    <td className="px-3 py-4 text-muted">{item.addToCart}</td>
                    <td className="px-3 py-4 text-muted">{item.purchases}</td>
                    <td className="px-3 py-4 text-muted">{formatCurrency(item.revenueCents, localeTag)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.revenueByProduct.length ? <p className="px-3 py-8 text-sm text-muted">{zh ? "所选时间范围内没有商品收入。" : "No product revenue in the selected range."}</p> : null}
          </AdminTablePanel>
        </>
      ) : null}
    </div>
  );
}
