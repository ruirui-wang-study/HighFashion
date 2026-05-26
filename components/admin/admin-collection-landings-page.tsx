"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminCollectionLandings } from "@/lib/admin-api";
import type { AdminCollectionLanding } from "@/lib/admin-content-types";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./admin-page-header";
import { ContentStatusBadge } from "./content-status-badge";

export function AdminCollectionLandingsPage() {
  const { locale, messages } = useLocale();
  const zh = locale === "zh";
  const [pages, setPages] = useState<AdminCollectionLanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminCollectionLandings()
      .then((data) => {
        if (!active) return;
        setPages(data);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载 collection 页面失败" : "Failed to load collection pages");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [zh]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={zh ? "内容" : "Content"}
        title={zh ? "Collection 落地页" : "Collection Landings"}
        body={zh ? "管理已批准品类页和场景页的 SEO 安全简介与双语落地文案。" : "Manage SEO-safe collection intros and bilingual landing copy for approved category and scenario pages."}
      />

      <section className="rounded-3xl bg-white p-5">
        {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
        {loading ? <p className="text-sm text-muted">{zh ? "正在加载 collection 落地页..." : "Loading collection landings..."}</p> : null}
        {!loading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{zh ? "页面" : "Page"}</th>
                  <th className="px-3 py-3">{zh ? "路径" : "Path"}</th>
                  <th className="px-3 py-3">{zh ? "状态" : "Status"}</th>
                  <th className="px-3 py-3">{zh ? "更新时间" : "Updated"}</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-graphite/5 align-top">
                    <td className="px-3 py-4">
                      <p className="font-bold text-graphite">{page.title}</p>
                      <p className="mt-1 text-xs text-muted">{page.scenario ? `${page.scenario} / ${page.slug}` : page.slug}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{page.pathname}</td>
                    <td className="px-3 py-4"><ContentStatusBadge status={page.status} /></td>
                    <td className="px-3 py-4 text-muted">{new Date(page.updatedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}</td>
                    <td className="px-3 py-4 text-right">
                      <Button asChild variant="ghost"><Link href={`/admin/content/collections/${page.id}`}>{messages.admin.common.edit}</Link></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!pages.length ? <p className="px-3 py-8 text-sm text-muted">{zh ? "没有 collection 落地页。" : "No collection landing pages found."}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
