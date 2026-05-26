"use client";

import { useEffect, useState } from "react";
import { exportAdminMerchantFeed, getAdminMerchantFeed } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { AdminMerchantFeedItem, AdminMerchantFeedOverview } from "@/lib/admin-marketing-types";
import { Button } from "@/components/ui/button";
import { AdminChartPanel } from "./admin-chart-panel";
import { AdminKpiCard } from "./admin-kpi-card";
import { AdminMerchantConnectionBadge } from "./admin-merchant-connection-badge";
import { AdminPageHeader } from "./admin-page-header";
import { AdminTablePanel } from "./admin-table-panel";

function readinessTone(readiness: AdminMerchantFeedItem["readiness"]) {
  return readiness === "ready" ? "bg-lime/20 text-graphite" : "bg-amber-100 text-amber-800";
}

export function AdminMerchantFeedPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [data, setData] = useState<AdminMerchantFeedOverview | null>(null);
  const [selectedItem, setSelectedItem] = useState<AdminMerchantFeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"xml" | "json" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminMerchantFeed()
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setSelectedItem(nextData.items[0] ?? null);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载 Merchant Feed 预览失败" : "Failed to load merchant feed preview");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [zh]);

  async function exportFeed(format: "xml" | "json") {
    setExporting(format);
    try {
      const file = await exportAdminMerchantFeed(format);
      const blob = new Blob([file.content], { type: file.mimeType });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = file.fileName;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "导出 Merchant Feed 失败" : "Failed to export merchant feed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={zh ? "营销" : "Marketing"}
        title={zh ? "Merchant Feed" : "Merchant Feed"}
        body={zh ? "预览启用商品的 feed 就绪度、检查缺失的 Google Merchant 字段，并在真实上传接通前导出 XML 或 JSON。" : "Preview active product feed readiness, inspect missing Google Merchant fields, and export XML or JSON before real Merchant Center upload is enabled."}
      />

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载 Merchant Feed 预览..." : "Loading merchant feed preview..."}</section> : null}

      {!loading && data ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <AdminMerchantConnectionBadge connection={data.connection} />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" disabled={exporting !== null} onClick={() => exportFeed("json")}>
                {exporting === "json" ? (zh ? "导出 JSON 中" : "Exporting JSON") : (zh ? "导出 JSON" : "Export JSON")}
              </Button>
              <Button variant="outline" disabled={exporting !== null} onClick={() => exportFeed("xml")}>
                {exporting === "xml" ? (zh ? "导出 XML 中" : "Exporting XML") : (zh ? "导出 XML" : "Export XML")}
              </Button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <AdminKpiCard label={zh ? "启用商品" : "Active products"} value={String(data.summary.totalProducts)} />
            <AdminKpiCard label={zh ? "可入 Feed" : "Feed ready"} value={String(data.summary.readyProducts)} />
            <AdminKpiCard label={zh ? "有问题" : "With issues"} value={String(data.summary.productsWithIssues)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            <AdminTablePanel title={zh ? "Feed 就绪度" : "Feed readiness"} body={zh ? "仅统计启用商品。缺少必填字段的条目会在导出前被标记。" : "Active products only. Items with missing required fields are flagged before export."}>
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    <th className="px-3 py-3">{zh ? "商品" : "Product"}</th>
                    <th className="px-3 py-3">{zh ? "就绪度" : "Readiness"}</th>
                    <th className="px-3 py-3">{zh ? "缺失字段" : "Missing fields"}</th>
                    <th className="px-3 py-3">{zh ? "预览" : "Preview"}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-graphite/5">
                      <td className="px-3 py-4">
                        <p className="font-bold text-graphite">{item.title || item.id}</p>
                        <p className="mt-1 text-xs text-muted">{item.link || (zh ? "无商品链接" : "No product link")}</p>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${readinessTone(item.readiness)}`}>
                          {item.readiness === "ready" ? (zh ? "可用" : "Ready") : (zh ? "字段缺失" : "Missing fields")}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-muted">
                        {item.missingFields.length ? item.missingFields.join(", ") : (zh ? "无" : "None")}
                      </td>
                      <td className="px-3 py-4">
                        <Button variant="ghost" onClick={() => setSelectedItem(item)}>{zh ? "查看条目" : "View item"}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTablePanel>

            <AdminChartPanel title={zh ? "Feed 条目预览" : "Feed item preview"} body={zh ? "当前归一化输出结构，供后续 Merchant Center 上传服务复用。" : "Current normalized output shaped for later Merchant Center upload service work."}>
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-warm p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{zh ? "当前选中" : "Selected item"}</p>
                    <p className="mt-2 font-bold text-graphite">{selectedItem.title || selectedItem.id}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{selectedItem.description || (zh ? "缺少描述" : "Missing description")}</p>
                  </div>
                  <pre className="overflow-x-auto rounded-2xl bg-graphite p-4 text-xs leading-6 text-white">
{JSON.stringify(selectedItem, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="rounded-2xl bg-warm p-6 text-sm text-muted">{zh ? "未选择 feed 条目。" : "No feed item selected."}</div>
              )}
            </AdminChartPanel>
          </section>
        </>
      ) : null}
    </div>
  );
}
