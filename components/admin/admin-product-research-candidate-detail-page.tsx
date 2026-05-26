"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  adjustProductResearchScore,
  convertProductResearchCandidate,
  createProductResearchDecision,
  createProductResearchTestLaunch,
  getProductResearchCandidate,
  recalculateProductResearchCandidate,
} from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { ProductResearchCandidateDetail } from "@/lib/product-research-types";
import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";

export function AdminProductResearchCandidateDetailPageClient({ id }: { id: string }) {
  const { locale, messages } = useLocale();
  const zh = locale === "zh";
  const [data, setData] = useState<ProductResearchCandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState("WATCH");
  const [decisionReason, setDecisionReason] = useState("");
  const [manualScore, setManualScore] = useState("");
  const [manualScoreReason, setManualScoreReason] = useState("");
  const [testChannel, setTestChannel] = useState("Meta Ads");
  const [testViews, setTestViews] = useState("120");
  const [testAtc, setTestAtc] = useState("8");
  const [testPurchases, setTestPurchases] = useState("2");

  async function fetchCandidate() {
    const result = await getProductResearchCandidate(id);
    setData(result);
    setError(null);
  }

  async function load() {
    setLoading(true);
    try {
      await fetchCandidate();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "加载候选品详情失败" : "Failed to load candidate detail");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getProductResearchCandidate(id)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载候选品详情失败" : "Failed to load candidate detail");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, zh]);

  async function runAction(action: string, handler: () => Promise<unknown>) {
    setBusy(action);
    setError(null);
    try {
      await handler();
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "操作失败" : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminProductResearchSectionShell
      eyebrow={zh ? "研究" : "Research"}
      title={data?.productName ?? (zh ? "候选品详情" : "Candidate Detail")}
      body={zh ? "在打样、批准或转换成正式商品草稿前，先查看评分历史、供应商质量、风险标记和测试信号。" : "Review score history, supplier quality, risk flags, and test signals before you sample, approve, or convert anything into a formal product draft."}
    >
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载候选品详情..." : "Loading candidate detail..."}</section> : null}
      {data ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
            <section className="rounded-3xl bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "概览" : "Overview"}</p>
                  <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-graphite">{data.productName}</h2>
                  <p className="mt-2 text-sm text-muted">{data.category} / {data.targetMarket} / {data.source}</p>
                </div>
                <Button
                  variant="outline"
                  disabled={busy === "recalculate"}
                  onClick={() => {
                    if (!window.confirm(zh ? "确认重算该候选品的信号、风险标记和分数吗？" : "Recalculate signals, risk flags, and score for this candidate?")) return;
                    void runAction("recalculate", async () => {
                      await recalculateProductResearchCandidate(id);
                    });
                  }}
                >
                  {busy === "recalculate" ? (zh ? "重算中..." : "Recalculating...") : (zh ? "重算" : "Recalculate")}
                </Button>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <ScoreCard label={zh ? "最终分" : "Final Score"} value={data.finalScore != null ? String(data.finalScore) : "-"} tone="lime" />
                <ScoreCard label={zh ? "风险分" : "Risk Score"} value={data.riskScore != null ? String(data.riskScore) : "-"} tone={data.primaryRiskSeverity === "BLOCKING" ? "red" : "neutral"} />
                <ScoreCard label={zh ? "验证后分数" : "Validated Score"} value={data.validatedScore != null ? String(data.validatedScore) : "-"} tone="neutral" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <DetailRow label={zh ? "状态" : "Status"} value={data.status} />
                <DetailRow label={zh ? "推荐动作" : "Recommended"} value={data.recommendedActionLabel} />
                <DetailRow label={zh ? "目标人群" : "Target audience"} value={data.targetAudience ?? "-"} />
                <DetailRow label={zh ? "使用场景" : "Use case"} value={data.useCase ?? "-"} />
              </div>
              <p className="mt-5 text-sm leading-6 text-muted">{data.description ?? (zh ? "暂无描述。" : "No description yet.")}</p>
              {data.possibleDuplicateOfId ? <p className="mt-3 text-sm font-semibold text-amber-700">{zh ? `可能与候选品 ${data.possibleDuplicateOfId} 重复` : `Possible duplicate of candidate ${data.possibleDuplicateOfId}`}</p> : null}
            </section>

            <section className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "转换" : "Convert"}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{zh ? "只有批准后才能转换，且转换得到的商品始终保持 `DRAFT`。" : "Convert is allowed only after approval, and the resulting product always stays in `DRAFT`."}</p>
              <Button
                className="mt-5 w-full"
                variant="lime"
                disabled={busy === "convert" || data.status !== "APPROVED" || data.primaryRiskSeverity === "BLOCKING"}
                onClick={() => {
                  if (!window.confirm(zh ? "确认把这个已批准候选品转换为商品草稿吗？" : "Convert this approved candidate into a Product draft?")) return;
                  void runAction("convert", async () => {
                    await convertProductResearchCandidate(id);
                  });
                }}
              >
                {busy === "convert" ? (zh ? "转换中..." : "Converting...") : (zh ? "转换为商品草稿" : "Convert to Product Draft")}
              </Button>
              <div className="mt-5 space-y-2">
                <ProgressBar label={zh ? "风险压力" : "Risk Pressure"} value={data.riskScore ?? 0} inverse={false} accent={data.primaryRiskSeverity === "BLOCKING" ? "red" : "amber"} />
                <ProgressBar label={zh ? "商品化信心" : "Merchandising Confidence"} value={data.finalScore ?? 0} inverse={false} accent="lime" />
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <ActionCard title={zh ? "决策" : "Decision"} subtitle={zh ? "所有状态变化都保持人工触发，并写入审计。" : "All state changes remain manual and audited."}>
              <select value={decision} onChange={(event) => setDecision(event.target.value)} className="w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
                <option value="WATCH">WATCH</option>
                <option value="SAMPLE">SAMPLE</option>
                <option value="TEST">TEST</option>
                <option value="APPROVE">APPROVE</option>
                <option value="REJECT">REJECT</option>
              </select>
              <textarea value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} className="min-h-24 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" placeholder={zh ? "填写本次决策原因" : "Reason for this decision"} />
              <Button
                className="w-full"
                disabled={busy === "decision"}
                onClick={() => {
                  if (!window.confirm(zh ? `确认应用决策 ${decision} 吗？` : `Apply decision ${decision}?`)) return;
                  void runAction("decision", async () => {
                    await createProductResearchDecision(id, { decision, reason: decisionReason || undefined });
                  });
                }}
              >
                {busy === "decision" ? (zh ? "应用中..." : "Applying...") : (zh ? "应用决策" : "Apply Decision")}
              </Button>
            </ActionCard>

            <ActionCard title={zh ? "人工调分" : "Manual Score"} subtitle={zh ? "仅在人工判断需要覆盖最新自动分数时使用。" : "Use only when operator judgement overrides the latest automatic score."}>
              <input value={manualScore} onChange={(event) => setManualScore(event.target.value)} type="number" min="0" max="100" className="w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" placeholder={zh ? "最终分 0-100" : "Final score 0-100"} />
              <textarea value={manualScoreReason} onChange={(event) => setManualScoreReason(event.target.value)} className="min-h-24 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" placeholder={zh ? "说明调分原因" : "Why the score changed"} />
              <Button
                className="w-full"
                disabled={busy === "score" || !manualScore}
                onClick={() => {
                  if (!window.confirm(zh ? "确认创建人工调分记录吗？" : "Create a manual score adjustment?")) return;
                  void runAction("score", async () => {
                    await adjustProductResearchScore(id, { finalScore: Number(manualScore), reason: manualScoreReason || undefined });
                  });
                }}
              >
                {busy === "score" ? messages.admin.common.saving : (zh ? "保存人工分数" : "Save Manual Score")}
              </Button>
            </ActionCard>

            <ActionCard title={zh ? "测试记录" : "Test Launch"} subtitle={zh ? "记录一条轻量测试结果，并回写到验证后分数。" : "Store a lightweight test result and roll it into the validated score."}>
              <input value={testChannel} onChange={(event) => setTestChannel(event.target.value)} className="w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" placeholder={zh ? "渠道" : "Channel"} />
              <div className="grid grid-cols-3 gap-2">
                <input value={testViews} onChange={(event) => setTestViews(event.target.value)} type="number" min="0" className="rounded-2xl border border-graphite/10 px-3 py-3 text-sm outline-none" placeholder={zh ? "浏览" : "Views"} />
                <input value={testAtc} onChange={(event) => setTestAtc(event.target.value)} type="number" min="0" className="rounded-2xl border border-graphite/10 px-3 py-3 text-sm outline-none" placeholder="ATC" />
                <input value={testPurchases} onChange={(event) => setTestPurchases(event.target.value)} type="number" min="0" className="rounded-2xl border border-graphite/10 px-3 py-3 text-sm outline-none" placeholder={zh ? "购买" : "Purchases"} />
              </div>
              <Button
                className="w-full"
                disabled={busy === "test"}
                onClick={() => {
                  if (!window.confirm(zh ? "确认创建测试快照吗？" : "Create a test launch snapshot?")) return;
                  void runAction("test", async () => {
                    await createProductResearchTestLaunch(id, {
                      channel: testChannel,
                      productViews: Number(testViews || 0),
                      addToCart: Number(testAtc || 0),
                      purchases: Number(testPurchases || 0),
                      status: "COMPLETED",
                    });
                  });
                }}
              >
                {busy === "test" ? messages.admin.common.saving : (zh ? "添加测试快照" : "Add Test Snapshot")}
              </Button>
            </ActionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "分数历史" : "Score History"}</p>
              <div className="mt-4 space-y-3">
                {data.scores.length === 0 ? <p className="text-sm text-muted">{zh ? "还没有分数快照。" : "No score snapshots yet."}</p> : null}
                {data.scores.slice(0, 5).map((score) => (
                  <div key={score.id} className="rounded-2xl bg-warm p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-graphite">{score.finalScore}</p>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{score.scoringVersion}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{new Date(score.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "市场信号" : "Market Signals"}</p>
              <div className="mt-4 space-y-3">
                {data.signals.length === 0 ? <p className="text-sm text-muted">{zh ? "还没有采集信号。" : "No signals collected yet."}</p> : null}
                {data.signals.slice(0, 8).map((signal) => (
                  <div key={signal.id} className="rounded-2xl bg-warm p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-graphite">{signal.metricName}</p>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{signal.source}</span>
                    </div>
                    <ProgressBar label={zh ? "信号" : "Signal"} value={signal.metricValue} inverse={false} accent="lime" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "供应商" : "Suppliers"}</p>
              <div className="mt-4 space-y-3">
                {data.suppliers.length === 0 ? <p className="text-sm text-muted">{zh ? "还没有关联供应商报价。" : "No supplier quotes linked yet."}</p> : null}
                {data.suppliers.map((supplier) => (
                  <div key={supplier.supplierId} className="rounded-2xl bg-warm p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-graphite">{supplier.supplierName}</p>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{supplier.platform}</span>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <p className="text-muted">{zh ? "单价" : "Unit"}: {supplier.quotedUnitPriceCents != null ? formatCents(supplier.quotedUnitPriceCents) : "-"}</p>
                      <p className="text-muted">MOQ: {supplier.quotedMoq ?? "-"}</p>
                      <p className="text-muted">{zh ? "交期" : "Lead time"}: {supplier.quotedLeadTimeDays ?? "-"}{zh ? " 天" : " days"}</p>
                      <p className="text-muted">{zh ? "美国运费" : "US ship"}: {supplier.shippingToUSCents != null ? formatCents(supplier.shippingToUSCents) : "-"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "风险标记" : "Risk Flags"}</p>
              <div className="mt-4 space-y-3">
                {data.riskFlags.length === 0 ? <p className="text-sm text-muted">{zh ? "还没有风险标记。" : "No risk flags yet."}</p> : null}
                {data.riskFlags.map((flag, index) => (
                  <div key={`${flag.riskType ?? "risk"}-${index}`} className="rounded-2xl bg-warm p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-graphite">{flag.riskType ?? (zh ? "风险" : "RISK")}</p>
                      <span className={`text-xs font-bold uppercase tracking-[0.12em] ${flag.severity === "BLOCKING" ? "text-red-700" : flag.severity === "HIGH" ? "text-amber-700" : "text-muted"}`}>{flag.severity}</span>
                    </div>
                    <p className="mt-2 text-muted">{flag.message ?? (zh ? "等待风险复核。" : "Risk review pending.")}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "测试记录" : "Test Launches"}</p>
              <div className="mt-4 space-y-3">
                {data.testLaunches.length === 0 ? <p className="text-sm text-muted">{zh ? "还没有测试记录。" : "No test launches yet."}</p> : null}
                {data.testLaunches.slice(0, 5).map((launch) => (
                  <div key={launch.id} className="rounded-2xl bg-warm p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-graphite">{launch.channel}</p>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{launch.status}</span>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2 text-sm text-muted">
                      <p>{zh ? "浏览" : "Views"}: {launch.productViews}</p>
                      <p>ATC: {launch.addToCart}</p>
                      <p>{zh ? "购买" : "Purchases"}: {launch.purchases}</p>
                      <p>{zh ? "收入" : "Revenue"}: {formatCents(launch.revenueCents)}</p>
                    </div>
                    <ProgressBar label={zh ? "测试分" : "Test Score"} value={launch.testScore ?? 0} inverse={false} accent="lime" />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "决策历史" : "Decision History"}</p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                      <th className="px-3 py-3">{zh ? "决策" : "Decision"}</th>
                      <th className="px-3 py-3">{zh ? "原因" : "Reason"}</th>
                      <th className="px-3 py-3">{zh ? "创建时间" : "Created"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.decisions.length === 0 ? <tr><td colSpan={3} className="px-3 py-6 text-center text-muted">{zh ? "还没有决策记录。" : "No decisions yet."}</td></tr> : null}
                    {data.decisions.map((item) => (
                      <tr key={item.id} className="border-b border-graphite/5">
                        <td className="px-3 py-4 font-bold text-graphite">{item.decision}</td>
                        <td className="px-3 py-4 text-muted">{item.reason ?? "-"}</td>
                        <td className="px-3 py-4 text-muted">{new Date(item.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </AdminProductResearchSectionShell>
  );
}

function ActionCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{title}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-warm px-4 py-3 text-sm">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 font-bold text-graphite">{value}</p>
    </div>
  );
}

function ScoreCard({ label, value, tone }: { label: string; value: string; tone: "lime" | "neutral" | "red" }) {
  const toneClass = tone === "lime" ? "bg-lime/10" : tone === "red" ? "bg-red-50" : "bg-warm";
  return (
    <div className={`rounded-2xl px-4 py-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-graphite">{value}</p>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  inverse,
  accent,
}: {
  label: string;
  value: number;
  inverse: boolean;
  accent: "lime" | "amber" | "red";
}) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  const width = inverse ? 100 - safeValue : safeValue;
  const barClass = accent === "red" ? "bg-red-500" : accent === "amber" ? "bg-amber-500" : "bg-lime";
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-muted">
        <span>{label}</span>
        <span>{safeValue}</span>
      </div>
      <div className="h-2 rounded-full bg-graphite/10">
        <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
