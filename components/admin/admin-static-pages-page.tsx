"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminStaticPages } from "@/lib/admin-api";
import type { AdminStaticPage } from "@/lib/admin-content-types";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./admin-page-header";
import { ContentStatusBadge } from "./content-status-badge";

function formatPageLabel(pageKey: AdminStaticPage["pageKey"], zh: boolean) {
  if (pageKey === "ABOUT") return zh ? "关于我们" : "About";
  if (pageKey === "FIT_GUIDE") return zh ? "尺码指南" : "Fit Guide";
  return zh ? "首页" : "Home Page";
}

export function AdminStaticPagesPage() {
  const { locale, messages } = useLocale();
  const zh = locale === "zh";
  const [pages, setPages] = useState<AdminStaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminStaticPages()
      .then((data) => {
        if (!active) return;
        setPages(data);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载静态页面失败" : "Failed to load static pages");
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
        title={zh ? "静态页面" : "Static Pages"}
        body={zh ? "管理 About、Fit Guide、Home Page 等固定前台页面，并分别维护中英文内容。" : "Manage fixed storefront pages like About and Fit Guide with separate English and Chinese content."}
      />

      <section className="rounded-3xl bg-white p-5">
        {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
        {loading ? <p className="text-sm text-muted">{zh ? "正在加载静态页面..." : "Loading static pages..."}</p> : null}
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
                      <p className="mt-1 text-xs text-muted">{formatPageLabel(page.pageKey, zh)} / {page.slug}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{page.pathname}</td>
                    <td className="px-3 py-4"><ContentStatusBadge status={page.status} /></td>
                    <td className="px-3 py-4 text-muted">{new Date(page.updatedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}</td>
                    <td className="px-3 py-4 text-right">
                      <Button asChild variant="ghost"><Link href={`/admin/content/static-pages/${page.id}`}>{messages.admin.common.edit}</Link></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!pages.length ? <p className="px-3 py-8 text-sm text-muted">{zh ? "没有静态页面。" : "No static pages found."}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
