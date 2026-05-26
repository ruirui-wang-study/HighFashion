"use client";

import { useEffect, useState } from "react";
import { getSeoContentPipeline, publishSeoContentBrief } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { ContentBriefItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";
import { Button } from "@/components/ui/button";

export function AdminSeoContentPipelinePageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ContentBriefItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await getSeoContentPipeline());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "加载内容管道失败" : "Failed to load content pipeline");
    }
  }

  useEffect(() => {
    let active = true;
    getSeoContentPipeline()
      .then((nextItems) => {
        if (!active) return;
        setItems(nextItems);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "????????" : "Failed to load content pipeline");
      });
    return () => {
      active = false;
    };
  }, [zh]);

  async function publish(id: string) {
    if (!window.confirm(zh ? "确认手动发布这条内容吗？" : "Publish this content item manually?")) return;
    await publishSeoContentBrief(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={zh ? "增长" : "Growth"} title={zh ? "内容管道" : "Content Pipeline"} body={zh ? "把关键词机会转成 brief 和草稿，只在人工审核后发布。" : "Convert keyword opportunities into briefs and drafts, then publish only after manual review."} />
      <AdminSeoNav />
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3">{zh ? "标题" : "Title"}</th>
              <th className="px-3 py-3">{zh ? "关键词" : "Keyword"}</th>
              <th className="px-3 py-3">{zh ? "大纲" : "Outline"}</th>
              <th className="px-3 py-3">{zh ? "状态" : "Status"}</th>
              <th className="px-3 py-3">{zh ? "草稿" : "Draft"}</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-graphite/5 align-top">
                <td className="px-3 py-4 font-bold text-graphite">{item.title}</td>
                <td className="px-3 py-4 text-muted">{item.targetKeyword}</td>
                <td className="px-3 py-4 text-muted">
                  <div className="space-y-1">
                    {item.outline.map((point) => <p key={point}>{point}</p>)}
                  </div>
                </td>
                <td className="px-3 py-4 text-muted">{item.status}</td>
                <td className="px-3 py-4">
                  <span className="rounded-full bg-warm px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-graphite">AI Draft</span>
                </td>
                <td className="px-3 py-4">
                  <Button variant="ghost" onClick={() => void publish(item.id)}>{zh ? "发布" : "Publish"}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
