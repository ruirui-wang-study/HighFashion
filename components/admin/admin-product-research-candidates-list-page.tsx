"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { bulkRecalculateProductResearchCandidates, getProductResearchCandidates } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { ProductResearchCandidateListItem } from "@/lib/product-research-types";
import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 25;

export function AdminProductResearchCandidatesPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ProductResearchCandidateListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("created-desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      try {
        const result = await getProductResearchCandidates({
          search: search || undefined,
          status: status || undefined,
          sort,
          page: nextPage,
          pageSize: PAGE_SIZE,
        });
        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);
        setSelectedIds((current) => current.filter((id) => result.items.some((item) => item.id === id)));
        setError(null);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : zh ? "加载候选品失败" : "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    },
    [search, sort, status, zh],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCandidates(1);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCandidates]);

  const allVisibleSelected = useMemo(() => items.length > 0 && items.every((item) => selectedIds.includes(item.id)), [items, selectedIds]);

  function patchSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function patchStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function patchSort(value: string) {
    setSort(value);
    setPage(1);
  }

  async function bulkRecalculate() {
    if (!selectedIds.length) return;
    if (!window.confirm(zh ? `确认重算 ${selectedIds.length} 个已选候选品吗？` : `Recalculate ${selectedIds.length} selected candidates?`)) return;

    setBusy(true);
    setError(null);
    try {
      await bulkRecalculateProductResearchCandidates(selectedIds, "Bulk recalculation from candidate list");
      await loadCandidates(page);
      setSelectedIds([]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "批量重算候选品失败" : "Failed to recalculate selected candidates");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminProductResearchSectionShell
      eyebrow={zh ? "研究" : "Research"}
      title={zh ? "候选品" : "Candidates"}
      body={zh ? "查看候选品质量、批量重算分数，并只把经得起推敲的想法推进到打样、测试和商品草稿转换。" : "Review candidate quality, batch-recalculate scores, and move only the defensible ideas toward samples, tests, and draft product conversion."}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted">
          {selectedIds.length > 0
            ? zh
              ? `已选 ${selectedIds.length} 个`
              : `${selectedIds.length} selected`
            : zh
              ? `共 ${total} 个候选品`
              : `${total} candidates total`}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={busy || selectedIds.length === 0} onClick={() => void bulkRecalculate()}>
            {busy ? (zh ? "重算中..." : "Recalculating...") : (zh ? "批量重算" : "Bulk Recalculate")}
          </Button>
          <Button asChild variant="lime">
            <Link href="/admin/product-research/candidates/new">{zh ? "新建候选品" : "New Candidate"}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-3xl border border-graphite/10 bg-white p-4 md:grid-cols-[2fr_1fr_1fr]">
        <input
          className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
          placeholder={zh ? "按商品名、品类、市场搜索" : "Search by product name, category, market"}
          value={search}
          onChange={(event) => patchSearch(event.target.value)}
        />
        <select
          className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
          value={status}
          onChange={(event) => patchStatus(event.target.value)}
        >
          <option value="">{zh ? "全部状态" : "All statuses"}</option>
          <option value="NEW">{zh ? "新建" : "New"}</option>
          <option value="RESEARCHING">{zh ? "研究中" : "Researching"}</option>
          <option value="WATCH">{zh ? "观察" : "Watch"}</option>
          <option value="SAMPLE">{zh ? "打样" : "Sample"}</option>
          <option value="TEST">{zh ? "测试" : "Test"}</option>
          <option value="APPROVED">{zh ? "已批准" : "Approved"}</option>
          <option value="REJECTED">{zh ? "已拒绝" : "Rejected"}</option>
          <option value="HIGH_RISK_REVIEW">{zh ? "高风险复核" : "High Risk Review"}</option>
        </select>
        <select
          className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
          value={sort}
          onChange={(event) => patchSort(event.target.value)}
        >
          <option value="created-desc">{zh ? "最新优先" : "Newest first"}</option>
          <option value="created-asc">{zh ? "最早优先" : "Oldest first"}</option>
          <option value="score-desc">{zh ? "最高分优先" : "Highest score"}</option>
          <option value="score-asc">{zh ? "最低分优先" : "Lowest score"}</option>
          <option value="updated-desc">{zh ? "最近更新" : "Recently updated"}</option>
        </select>
      </div>

      {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded-3xl border border-graphite/10 bg-white">
        <div className="grid grid-cols-[0.35fr_2fr_0.9fr_0.9fr_0.8fr_0.8fr_1fr] gap-3 border-b border-graphite/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
          <label className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={(event) => {
                setSelectedIds(event.target.checked ? items.map((item) => item.id) : []);
              }}
            />
          </label>
          <span>{zh ? "候选品" : "Candidate"}</span>
          <span>{zh ? "市场" : "Market"}</span>
          <span>{zh ? "状态" : "Status"}</span>
          <span>{zh ? "分数" : "Score"}</span>
          <span>{zh ? "风险" : "Risk"}</span>
          <span>{zh ? "动作" : "Action"}</span>
        </div>
        {loading ? (
          <div className="px-4 py-6 text-sm text-muted">{zh ? "正在加载候选品..." : "Loading candidates..."}</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted">{zh ? "没有候选品。可以从 AI 生成、CSV 导入或手工草稿开始。" : "No candidates found. Start with AI generation, CSV import, or a manual draft."}</div>
        ) : (
          <div className="divide-y divide-graphite/10">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[0.35fr_2fr_0.9fr_0.9fr_0.8fr_0.8fr_1fr] gap-3 px-4 py-4 text-sm transition hover:bg-warm">
                <label className="flex items-start justify-center pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={(event) => {
                      setSelectedIds((current) => (
                        event.target.checked ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id)
                      ));
                    }}
                  />
                </label>
                <Link href={`/admin/product-research/candidates/${item.id}`} className="min-w-0">
                  <p className="font-semibold text-graphite">{item.productName}</p>
                  <p className="truncate text-xs text-muted">{item.category} · {item.source}</p>
                </Link>
                <span>{item.targetMarket}</span>
                <span className={item.status === "HIGH_RISK_REVIEW" ? "font-semibold text-red-600" : ""}>{item.status}</span>
                <span>{item.finalScore ?? "-"}</span>
                <span className={item.primaryRiskSeverity === "BLOCKING" || item.primaryRiskSeverity === "HIGH" ? "font-semibold text-red-600" : ""}>
                  {item.riskScore ?? "-"} / {item.primaryRiskSeverity}
                </span>
                <span>{item.recommendedActionLabel}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-graphite/10 bg-white px-4 py-3 text-sm">
          <span className="text-muted">
            {zh ? `第 ${page} / ${totalPages} 页` : `Page ${page} of ${totalPages}`}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || busy} onClick={() => void loadCandidates(page - 1)}>
              {zh ? "上一页" : "Previous"}
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages || busy} onClick={() => void loadCandidates(page + 1)}>
              {zh ? "下一页" : "Next"}
            </Button>
          </div>
        </div>
      ) : null}
    </AdminProductResearchSectionShell>
  );
}
