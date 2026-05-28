"use client";

import { useCallback, useEffect, useState } from "react";
import { getSeoChangeLog } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { SeoChangeLogItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";

const PAGE_SIZE = 20;

export function AdminSeoChangeLogPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const localeTag = zh ? "zh-CN" : "en-US";
  const [items, setItems] = useState<SeoChangeLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        const result = await getSeoChangeLog({ page: nextPage, pageSize: PAGE_SIZE });
        setItems((current) => (append ? [...current, ...result.items] : result.items));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setError(null);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : zh ? "加载变更日志失败" : "Failed to load change log");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [zh],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPage(1, false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPage]);

  const canLoadMore = page < totalPages;

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
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-muted">
                  {zh ? "加载中…" : "Loading…"}
                </td>
              </tr>
            ) : null}
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
        {canLoadMore ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => void loadPage(page + 1, true)}
              className="rounded-full border border-graphite/15 px-5 py-2 text-sm font-bold text-graphite transition hover:border-graphite disabled:opacity-50"
            >
              {loadingMore ? (zh ? "加载中…" : "Loading…") : zh ? "加载更多" : "Load more"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
