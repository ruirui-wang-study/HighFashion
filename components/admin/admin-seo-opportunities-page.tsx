"use client";

import { useEffect, useMemo, useState } from "react";
import { createSeoContentBrief, generateSeoOpportunities, getSeoOpportunities } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { ContentOpportunityItem } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";
import { Button } from "@/components/ui/button";

export function AdminSeoOpportunitiesPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ContentOpportunityItem[]>([]);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [type, setType] = useState("all");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await getSeoOpportunities());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "加载机会列表失败" : "Failed to load opportunities");
    }
  }

  useEffect(() => {
    let active = true;
    getSeoOpportunities()
      .then((nextItems) => {
        if (!active) return;
        setItems(nextItems);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "????????" : "Failed to load opportunities");
      });
    return () => {
      active = false;
    };
  }, [zh]);

  const filtered = useMemo(
    () => items.filter((item) => (status === "all" || item.status === status) && (priority === "all" || item.priority === priority) && (type === "all" || item.opportunityType === type)),
    [items, priority, status, type],
  );

  async function regenerate() {
    await generateSeoOpportunities();
    await load();
  }

  async function createBrief(id: string) {
    if (!window.confirm(zh ? "确认基于这个机会创建内容 brief 吗？" : "Create a content brief from this opportunity?")) return;
    await createSeoContentBrief(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={zh ? "增长" : "Growth"} title={zh ? "关键词机会" : "Keyword Opportunities"} body={zh ? "在创建新内容或改写元信息前，先筛选高潜力关键词和页面机会。" : "Prioritize high-potential queries and pages before creating new content or rewriting metadata."} />
      <AdminSeoNav />
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => void regenerate()}>{zh ? "生成机会" : "Generate Opportunities"}</Button>
      </div>
      <FilterBar zh={zh} status={status} priority={priority} type={type} setStatus={setStatus} setPriority={setPriority} setType={setType} types={[...new Set(items.map((item) => item.opportunityType))]} />
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <section className="overflow-x-auto rounded-3xl bg-white p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3">{zh ? "类型" : "Type"}</th>
              <th className="px-3 py-3">{zh ? "关键词" : "Keyword"}</th>
              <th className="px-3 py-3">{zh ? "当前页面" : "Current Page"}</th>
              <th className="px-3 py-3">{zh ? "建议动作" : "Suggested Action"}</th>
              <th className="px-3 py-3">{zh ? "优先级" : "Priority"}</th>
              <th className="px-3 py-3">{zh ? "状态" : "Status"}</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-graphite/5">
                <td className="px-3 py-4 font-bold text-graphite">{item.opportunityType}</td>
                <td className="px-3 py-4 text-muted">{item.keyword ?? "-"}</td>
                <td className="px-3 py-4 text-muted">{item.currentPage ?? "-"}</td>
                <td className="px-3 py-4 text-muted">{item.suggestedAction}</td>
                <td className="px-3 py-4 text-muted">{item.priority}</td>
                <td className="px-3 py-4 text-muted">{item.status}</td>
                <td className="px-3 py-4">
                  <Button variant="ghost" onClick={() => void createBrief(item.id)}>{zh ? "创建 Brief" : "Create Brief"}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function FilterBar(props: {
  zh: boolean;
  status: string;
  priority: string;
  type: string;
  setStatus: (value: string) => void;
  setPriority: (value: string) => void;
  setType: (value: string) => void;
  types: string[];
}) {
  return (
    <section className="grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-3">
      <select value={props.status} onChange={(event) => props.setStatus(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
        <option value="all">{props.zh ? "全部状态" : "All status"}</option>
        <option value="NEW">{props.zh ? "新建" : "New"}</option>
        <option value="DONE">{props.zh ? "已完成" : "Done"}</option>
      </select>
      <select value={props.priority} onChange={(event) => props.setPriority(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
        <option value="all">{props.zh ? "全部优先级" : "All priority"}</option>
        <option value="HIGH">{props.zh ? "高" : "High"}</option>
        <option value="MEDIUM">{props.zh ? "中" : "Medium"}</option>
      </select>
      <select value={props.type} onChange={(event) => props.setType(event.target.value)} className="rounded-2xl border border-graphite/10 px-4 py-3 outline-none">
        <option value="all">{props.zh ? "全部类型" : "All type"}</option>
        {props.types.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </section>
  );
}
