"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminGuides } from "@/lib/admin-api";
import type { AdminContentStatus, AdminGuide } from "@/lib/admin-content-types";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./admin-page-header";
import { ContentStatusBadge } from "./content-status-badge";

export function AdminGuidesPage() {
  const { locale, messages } = useLocale();
  const zh = locale === "zh";
  const [status, setStatus] = useState("");
  const [guides, setGuides] = useState<AdminGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminGuides(status ? { status } : {})
      .then((data) => {
        if (!active) return;
        setGuides(data);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载 guides 失败" : "Failed to load guides");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, zh]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={zh ? "内容" : "Content"}
        title="Guides"
        body={zh ? "在同一编辑界面管理 guide 的发布状态、SEO 元数据和关联商品链接。" : "Manage guide publishing state, SEO metadata, and related commerce links from one editor surface."}
        action={{ href: "/admin/content/guides/new", label: zh ? "新建 guide" : "New guide" }}
      />

      <section className="rounded-3xl bg-white p-5">
        <div className="flex flex-wrap gap-2">
          {["", "DRAFT", "PUBLISHED", "ARCHIVED"].map((item) => (
            <button
              key={item || "all"}
              type="button"
              onClick={() => {
                setLoading(true);
                setStatus(item);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${status === item ? "bg-graphite text-white" : "bg-warm text-graphite"}`}
            >
              {item || (zh ? "全部" : "All")}
            </button>
          ))}
        </div>
        {error ? <p className="mt-4 text-sm font-bold text-red-700">{error}</p> : null}
        {loading ? <p className="mt-6 text-sm text-muted">{zh ? "正在加载 guides..." : "Loading guides..."}</p> : null}
        {!loading ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">Guide</th>
                  <th className="px-3 py-3">{zh ? "状态" : "Status"}</th>
                  <th className="px-3 py-3">SEO</th>
                  <th className="px-3 py-3">{zh ? "更新时间" : "Updated"}</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {guides.map((guide) => (
                  <tr key={guide.id} className="border-b border-graphite/5 align-top">
                    <td className="px-3 py-4">
                      <p className="font-bold text-graphite">{guide.title}</p>
                      <p className="mt-1 text-xs text-muted">/{guide.slug}</p>
                    </td>
                    <td className="px-3 py-4">
                      <ContentStatusBadge status={guide.status as AdminContentStatus} />
                    </td>
                    <td className="px-3 py-4 text-muted">
                      <p>{guide.seoTitle || (zh ? "缺少标题" : "Missing title")}</p>
                      <p className="mt-1 text-xs">{guide.seoDescription || (zh ? "缺少描述" : "Missing description")}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{new Date(guide.updatedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}</td>
                    <td className="px-3 py-4 text-right">
                      <Button asChild variant="ghost"><Link href={`/admin/content/guides/${guide.id}`}>{messages.admin.common.edit}</Link></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!guides.length ? <p className="px-3 py-8 text-sm text-muted">{zh ? "当前筛选条件下没有 guides。" : "No guides match the current filter."}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
