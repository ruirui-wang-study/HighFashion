"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductResearchRiskReview, resolveProductResearchRiskFlag } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { ProductResearchRiskReviewItem } from "@/lib/product-research-types";
import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";
import { Button } from "@/components/ui/button";

export function AdminProductResearchRiskReviewPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ProductResearchRiskReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyFlagId, setBusyFlagId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadQueue() {
    setLoading(true);
    try {
      const result = await getProductResearchRiskReview();
      setItems(result);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "加载风险复核队列失败" : "Failed to load risk review queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQueue();
    }, 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zh]);

  async function resolveFlag(candidateId: string, flagId: string) {
    const note = window.prompt(zh ? "处理备注（可选）" : "Resolution note (optional)") ?? "";
    if (!window.confirm(zh ? "确认标记该风险为已处理？" : "Mark this risk flag as resolved?")) {
      return;
    }

    setBusyFlagId(flagId);
    setError(null);
    try {
      await resolveProductResearchRiskFlag(candidateId, flagId, note || undefined);
      await loadQueue();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "处理风险标记失败" : "Failed to resolve risk flag");
    } finally {
      setBusyFlagId(null);
    }
  }

  return (
    <AdminProductResearchSectionShell
      eyebrow={zh ? "研究" : "Research"}
      title={zh ? "风险复核" : "Risk Review"}
      body={zh ? "阻断级和高风险候选品会保留在人工复核中，直到商品、合规和供应链假设被明确处理。" : "Blocking and high-risk candidates stay in manual review until the product, compliance, and supplier assumptions are explicitly resolved."}
    >
      {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载风险复核队列..." : "Loading risk review queue..."}</section> : null}
      {!loading ? (
        <section className="grid gap-4 md:grid-cols-2">
          {items.length === 0 ? <div className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "当前没有待处理的高风险候选品。" : "No open high-risk candidates in queue."}</div> : null}
          {items.map((item) => (
            <article key={item.id} className="rounded-3xl bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/admin/product-research/candidates/${item.id}`} className="font-bold text-graphite hover:underline">
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{item.category} · {item.targetMarket}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${item.primaryRiskSeverity === "BLOCKING" ? "bg-red-600 text-white" : "bg-red-100 text-red-700"}`}>
                  {item.primaryRiskSeverity}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <Metric label={zh ? "状态" : "Status"} value={item.status} />
                <Metric label={zh ? "分数" : "Score"} value={item.finalScore != null ? String(item.finalScore) : "-"} />
                <Metric label={zh ? "风险" : "Risk"} value={item.riskScore != null ? String(item.riskScore) : "-"} />
              </div>
              <div className="mt-4 space-y-3">
                {item.openRiskFlags.map((flag) => (
                  <div key={flag.id} className="rounded-2xl bg-warm p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-graphite">{flag.riskType}</p>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">{flag.severity}</span>
                    </div>
                    <p className="mt-2 text-muted">{flag.message}</p>
                    <Button
                      className="mt-3"
                      size="sm"
                      variant="outline"
                      disabled={busyFlagId === flag.id}
                      onClick={() => void resolveFlag(item.id, flag.id)}
                    >
                      {busyFlagId === flag.id ? (zh ? "处理中..." : "Resolving...") : (zh ? "标记已处理" : "Mark Resolved")}
                    </Button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </AdminProductResearchSectionShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-warm px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-semibold text-graphite">{value}</p>
    </div>
  );
}
