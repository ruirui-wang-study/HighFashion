"use client";

import { useEffect, useState } from "react";
import { getProductResearchDashboard } from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { ProductResearchDashboard } from "@/lib/product-research-types";
import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";

export function AdminProductResearchDashboardPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const localeTag = zh ? "zh-CN" : "en-US";
  const [data, setData] = useState<ProductResearchDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProductResearchDashboard()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载选品研究看板失败" : "Failed to load product research dashboard");
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
      title={zh ? "选品研究看板" : "Product Research Dashboard"}
      body={zh ? "查看导入管道、高风险队列、最近决策，以及哪些候选品最接近真实商品审核。" : "Review the intake pipeline, high-risk queue, recent decisions, and which candidates are closest to real merchandising review."}
    >
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载选品研究看板..." : "Loading product research dashboard..."}</section> : null}
      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label={zh ? "候选品" : "Candidates"} value={String(data.summary.totalCandidates)} />
            <MetricCard label={zh ? "高风险" : "High Risk"} value={String(data.summary.highRiskCandidates)} />
            <MetricCard label={zh ? "已批准" : "Approved"} value={String(data.summary.approvedCandidates)} />
            <MetricCard label={zh ? "测试中" : "Running Tests"} value={String(data.summary.runningTests)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <BreakdownCard title={zh ? "状态分布" : "Status Breakdown"} items={data.statusBreakdown} emptyLabel={zh ? "暂无记录。" : "No records yet."} />
            <BreakdownCard title={zh ? "推荐动作分布" : "Recommended Actions"} items={data.recommendedActionBreakdown} emptyLabel={zh ? "暂无记录。" : "No records yet."} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <section className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "AI Provider" : "AI Provider"}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <DetailTile label={zh ? "当前 Provider" : "Active provider"} value={data.summary.providerStatus.activeAiProvider} />
                <DetailTile label={zh ? "API Key 来源" : "API key source"} value={data.summary.providerStatus.aiApiKeySource} />
                <DetailTile label={zh ? "已配置 Key" : "Key configured"} value={data.summary.providerStatus.aiApiKeyConfigured ? (zh ? "是" : "Yes") : (zh ? "否" : "No")} />
                <DetailTile label={zh ? "Base URL" : "Base URL"} value={data.summary.providerStatus.activeAiBaseUrl ?? "-"} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <DetailTile label={zh ? "候选品模型" : "Candidate model"} value={data.summary.providerStatus.activeAiModels.candidateGeneration ?? "-"} />
                <DetailTile label={zh ? "评分模型" : "Scoring model"} value={data.summary.providerStatus.activeAiModels.scoring ?? "-"} />
                <DetailTile label={zh ? "文案模型" : "Copy model"} value={data.summary.providerStatus.activeAiModels.copy ?? "-"} />
                <DetailTile label={zh ? "快速模型" : "Fast model"} value={data.summary.providerStatus.activeAiModels.fast ?? "-"} />
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "Provider 就绪度" : "Provider readiness"}</p>
              <div className="mt-4 space-y-3">
                <ProviderRow label="OpenAI" ready={data.summary.providerStatus.openAiConfigured} zh={zh} />
                <ProviderRow label="DeepSeek" ready={data.summary.providerStatus.deepSeekConfigured} zh={zh} />
                <ProviderRow label="MiMo" ready={data.summary.providerStatus.mimoConfigured} zh={zh} />
                <ProviderRow label="Google Trends" ready={data.summary.providerStatus.googleTrendsConfigured} zh={zh} />
                <ProviderRow label="GSC" ready={data.summary.providerStatus.gscConfigured} zh={zh} />
                <ProviderRow label="GA4" ready={data.summary.providerStatus.ga4Configured} zh={zh} />
              </div>
            </section>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <TimelineCard
              title={zh ? "最近导入" : "Recent Imports"}
              rows={data.recentImports.map((item) => ({
                key: item.id,
                title: item.fileName ?? item.source,
                meta: `${item.source} / ${new Date(item.createdAt).toLocaleString(localeTag)}`,
              }))}
              empty={zh ? "还没有导入批次。" : "No import batches yet."}
            />
            <TimelineCard
              title={zh ? "最近决策" : "Recent Decisions"}
              rows={data.recentDecisions.map((item) => ({
                key: item.id,
                title: item.decision,
                meta: `${item.candidateId} / ${new Date(item.createdAt).toLocaleString(localeTag)}`,
              }))}
              empty={zh ? "还没有决策记录。" : "No decisions yet."}
            />
          </section>
        </>
      ) : null}
    </AdminProductResearchSectionShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl font-black text-graphite">{value}</p>
    </div>
  );
}

function BreakdownCard({ title, items, emptyLabel }: { title: string; items: Record<string, number>; emptyLabel: string }) {
  return (
    <section className="rounded-3xl bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{title}</p>
      <div className="mt-4 space-y-3">
        {Object.entries(items).length === 0 ? <p className="text-sm text-muted">{emptyLabel}</p> : null}
        {Object.entries(items).map(([key, count]) => (
          <div key={key} className="flex items-center justify-between rounded-2xl bg-warm px-4 py-3 text-sm">
            <span className="font-bold text-graphite">{key}</span>
            <span className="text-muted">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimelineCard({ title, rows, empty }: { title: string; rows: Array<{ key: string; title: string; meta: string }>; empty: string }) {
  return (
    <section className="rounded-3xl bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{title}</p>
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? <p className="text-sm text-muted">{empty}</p> : null}
        {rows.map((row) => (
          <div key={row.key} className="rounded-2xl bg-warm px-4 py-3">
            <p className="font-bold text-graphite">{row.title}</p>
            <p className="mt-1 text-sm text-muted">{row.meta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-warm px-4 py-3 text-sm">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 break-all font-bold text-graphite">{value}</p>
    </div>
  );
}

function ProviderRow({ label, ready, zh }: { label: string; ready: boolean; zh: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-warm px-4 py-3 text-sm">
      <span className="font-bold text-graphite">{label}</span>
      <span className={ready ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>
        {ready ? (zh ? "已配置" : "Configured") : (zh ? "未配置" : "Not configured")}
      </span>
    </div>
  );
}
