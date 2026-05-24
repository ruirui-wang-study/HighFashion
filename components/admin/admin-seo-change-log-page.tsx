"use client";

import { useEffect, useState } from "react";
import { getSeoChangeLog } from "@/lib/admin-api";
import type { SeoChangeLogItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";

export function AdminSeoChangeLogPageClient() {
  const [items, setItems] = useState<SeoChangeLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSeoChangeLog()
      .then((next) => {
        setItems(next);
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : "Failed to load change log");
      });
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Growth" title="SEO Change Log" body="Audit every manual Apply and publish action performed through SEO automation." />
      <AdminSeoNav />
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3">Action</th>
              <th className="px-3 py-3">Resource</th>
              <th className="px-3 py-3">Resource ID</th>
              <th className="px-3 py-3">Operator</th>
              <th className="px-3 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-graphite/5">
                <td className="px-3 py-4 font-bold text-graphite">{item.action}</td>
                <td className="px-3 py-4 text-muted">{item.resourceType}</td>
                <td className="px-3 py-4 text-muted">{item.resourceId ?? "-"}</td>
                <td className="px-3 py-4 text-muted">{item.operatorId ?? "-"}</td>
                <td className="px-3 py-4 text-muted">{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
