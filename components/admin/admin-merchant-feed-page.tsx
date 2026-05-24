"use client";

import { useEffect, useState } from "react";
import { exportAdminMerchantFeed, getAdminMerchantFeed } from "@/lib/admin-api";
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
        setError(nextError instanceof Error ? nextError.message : "Failed to load merchant feed preview");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
      setError(nextError instanceof Error ? nextError.message : "Failed to export merchant feed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Marketing"
        title="Merchant Feed"
        body="Preview active product feed readiness, inspect missing Google Merchant fields, and export XML or JSON before real Merchant Center upload is enabled."
      />

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">Loading merchant feed preview...</section> : null}

      {!loading && data ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <AdminMerchantConnectionBadge connection={data.connection} />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" disabled={exporting !== null} onClick={() => exportFeed("json")}>
                {exporting === "json" ? "Exporting JSON" : "Export JSON"}
              </Button>
              <Button variant="outline" disabled={exporting !== null} onClick={() => exportFeed("xml")}>
                {exporting === "xml" ? "Exporting XML" : "Export XML"}
              </Button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <AdminKpiCard label="Active products" value={String(data.summary.totalProducts)} />
            <AdminKpiCard label="Feed ready" value={String(data.summary.readyProducts)} />
            <AdminKpiCard label="With issues" value={String(data.summary.productsWithIssues)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            <AdminTablePanel title="Feed readiness" body="Active products only. Items with missing required fields are flagged before export.">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    <th className="px-3 py-3">Product</th>
                    <th className="px-3 py-3">Readiness</th>
                    <th className="px-3 py-3">Missing fields</th>
                    <th className="px-3 py-3">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-graphite/5">
                      <td className="px-3 py-4">
                        <p className="font-bold text-graphite">{item.title || item.id}</p>
                        <p className="mt-1 text-xs text-muted">{item.link || "No product link"}</p>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${readinessTone(item.readiness)}`}>
                          {item.readiness === "ready" ? "Ready" : "Missing fields"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-muted">
                        {item.missingFields.length ? item.missingFields.join(", ") : "None"}
                      </td>
                      <td className="px-3 py-4">
                        <Button variant="ghost" onClick={() => setSelectedItem(item)}>View item</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTablePanel>

            <AdminChartPanel title="Feed item preview" body="Current normalized output shaped for later Merchant Center upload service work.">
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-warm p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Selected item</p>
                    <p className="mt-2 font-bold text-graphite">{selectedItem.title || selectedItem.id}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{selectedItem.description || "Missing description"}</p>
                  </div>
                  <pre className="overflow-x-auto rounded-2xl bg-graphite p-4 text-xs leading-6 text-white">
{JSON.stringify(selectedItem, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="rounded-2xl bg-warm p-6 text-sm text-muted">No feed item selected.</div>
              )}
            </AdminChartPanel>
          </section>
        </>
      ) : null}
    </div>
  );
}
