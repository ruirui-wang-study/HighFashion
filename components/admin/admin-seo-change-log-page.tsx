"use client";

import { useEffect, useState } from "react";
import { getSeoChangeLog } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { SeoChangeLogItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";

export function AdminSeoChangeLogPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const localeTag = zh ? "zh-CN" : "en-US";
  const [items, setItems] = useState<SeoChangeLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSeoChangeLog()
      .then((next) => {
        setItems(next);
        setError(null);
      })
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : zh ? "加载变更日志失败" : "Failed to load change log");
      });
  }, [zh]);

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={zh ? "增长" : "Growth"} title={zh ? "SEO 变更日志" : "SEO Change Log"} body={zh ? "审计所有通过 SEO 自动化执行的人工 Apply 与 Publish 操作。" : "Audit every manual Apply and publish action performed through SEO automation."} />
      <AdminSeoNav />
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3">{zh ? "动作" : "Action"}</th>
              <th className="px-3 py-3">{zh ? "资源" : "Resource"}</th>
              <th className="px-3 py-3">{zh ? "资源 ID" : "Resource ID"}</th>
              <th className="px-3 py-3">{zh ? "操作人" : "Operator"}</th>
              <th className="px-3 py-3">{zh ? "创建时间" : "Created"}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-graphite/5">
                <td className="px-3 py-4 font-bold text-graphite">{item.action}</td>
                <td className="px-3 py-4 text-muted">{item.resourceType}</td>
                <td className="px-3 py-4 text-muted">{item.resourceId ?? "-"}</td>
                <td className="px-3 py-4 text-muted">{item.operatorId ?? "-"}</td>
                <td className="px-3 py-4 text-muted">{new Date(item.createdAt).toLocaleString(localeTag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
