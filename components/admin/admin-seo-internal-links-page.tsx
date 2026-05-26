"use client";

import { useEffect, useState } from "react";
import { applySeoInternalLink, generateSeoInternalLinks, getSeoInternalLinks } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { InternalLinkSuggestionItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";
import { Button } from "@/components/ui/button";

export function AdminSeoInternalLinksPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<InternalLinkSuggestionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await getSeoInternalLinks());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "加载内链建议失败" : "Failed to load internal links");
    }
  }

  useEffect(() => {
    let active = true;
    getSeoInternalLinks()
      .then((nextItems) => {
        if (!active) return;
        setItems(nextItems);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "????????" : "Failed to load internal links");
      });
    return () => {
      active = false;
    };
  }, [zh]);

  async function regenerate() {
    await generateSeoInternalLinks();
    await load();
  }

  async function applyItem(id: string) {
    if (!window.confirm(zh ? "确认将这条内链建议应用到页面内容吗？" : "Apply this internal link suggestion to page content?")) return;
    await applySeoInternalLink(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={zh ? "增长" : "Growth"} title={zh ? "内链建议" : "Internal Link Suggestions"} body={zh ? "在写入任何内容前，先核对来源页、目标页和锚文本。" : "Review source, target, and anchor text before any internal link change is written."} />
      <AdminSeoNav />
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => void regenerate()}>{zh ? "生成内链建议" : "Generate Internal Links"}</Button>
      </div>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3">{zh ? "来源" : "Source"}</th>
              <th className="px-3 py-3">{zh ? "目标" : "Target"}</th>
              <th className="px-3 py-3">{zh ? "锚文本" : "Anchor Text"}</th>
              <th className="px-3 py-3">{zh ? "原因" : "Reason"}</th>
              <th className="px-3 py-3">{zh ? "优先级" : "Priority"}</th>
              <th className="px-3 py-3">{zh ? "状态" : "Status"}</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-graphite/5">
                <td className="px-3 py-4 font-bold text-graphite">{item.sourcePage}</td>
                <td className="px-3 py-4 text-muted">{item.targetPage}</td>
                <td className="px-3 py-4 text-muted">{item.anchorText}</td>
                <td className="px-3 py-4 text-muted">{item.reason}</td>
                <td className="px-3 py-4 text-muted">{item.priority}</td>
                <td className="px-3 py-4 text-muted">{item.status}</td>
                <td className="px-3 py-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => void applyItem(item.id)}>{zh ? "应用" : "Apply"}</Button>
                    <Button variant="ghost">{zh ? "拒绝" : "Reject"}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
