"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductResearchRiskReview } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { ProductResearchCandidateListItem } from "@/lib/product-research-types";
import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";

export function AdminProductResearchRiskReviewPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ProductResearchCandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProductResearchRiskReview()
      .then((result) => {
        if (!active) return;
        setItems(result);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载风险复核队列失败" : "Failed to load risk review queue");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [zh]);

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
          {items.length === 0 ? <div className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "当前没有高风险候选品。" : "No high-risk candidates in queue."}</div> : null}
          {items.map((item) => (
            <Link key={item.id} href={`/admin/product-research/candidates/${item.id}`} className="rounded-3xl bg-white p-6 transition hover:bg-warm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-graphite">{item.productName}</p>
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
            </Link>
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
