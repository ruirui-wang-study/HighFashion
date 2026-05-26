"use client";

import { useEffect, useState } from "react";
import {
  generateSeoOpportunities,
  generateSeoRecommendations,
  getSeoAutomationOverview,
  runSeoHealthCheck,
  syncSeoGa4,
  syncSeoGsc,
} from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { SeoAutomationOverview } from "@/lib/seo-automation-types";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSeoNav } from "./admin-seo-nav";
import { Button } from "@/components/ui/button";

export function AdminSeoAutomationPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const localeTag = zh ? "zh-CN" : "en-US";
  const [data, setData] = useState<SeoAutomationOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setData(await getSeoAutomationOverview());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "加载 SEO 自动化总览失败" : "Failed to load SEO automation overview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getSeoAutomationOverview()
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "?? SEO ???????" : "Failed to load SEO automation overview");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [zh]);

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
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={zh ? "增长" : "Growth"}
        title={zh ? "SEO 自动化" : "SEO Automation"}
        body={zh ? "执行健康检查、同步 Google 数据、生成机会与建议，并确保所有 AI 输出都经过人工审核。" : "Run health checks, sync Google data, generate opportunities, and keep all AI output behind manual review."}
      />
      <AdminSeoNav />

      <section className="grid gap-3 rounded-3xl bg-white p-6 xl:grid-cols-5">
        <Button variant="lime" disabled={busy === "health"} onClick={() => void runAction("health", runSeoHealthCheck)}>
          {busy === "health" ? (zh ? "执行中..." : "Running...") : (zh ? "运行健康检查" : "Run Health Check")}
        </Button>
        <Button variant="ghost" disabled={busy === "gsc"} onClick={() => void runAction("gsc", syncSeoGsc)}>
          {busy === "gsc" ? (zh ? "同步中..." : "Syncing...") : (zh ? "同步 GSC" : "Sync GSC")}
        </Button>
        <Button variant="ghost" disabled={busy === "ga4"} onClick={() => void runAction("ga4", syncSeoGa4)}>
          {busy === "ga4" ? (zh ? "同步中..." : "Syncing...") : (zh ? "同步 GA4" : "Sync GA4")}
        </Button>
        <Button variant="ghost" disabled={busy === "opps"} onClick={() => void runAction("opps", generateSeoOpportunities)}>
          {busy === "opps" ? (zh ? "生成中..." : "Generating...") : (zh ? "生成机会" : "Generate Opportunities")}
        </Button>
        <Button variant="ghost" disabled={busy === "recs"} onClick={() => void runAction("recs", generateSeoRecommendations)}>
          {busy === "recs" ? (zh ? "生成中..." : "Generating...") : (zh ? "生成建议" : "Generate Recommendations")}
        </Button>
      </section>

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载 SEO 自动化总览..." : "Loading automation overview..."}</section> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label={zh ? "已扫描页面" : "Scanned pages"}
              value={String(data.healthCheck.scannedPages)}
              note={data.healthCheck.lastRunAt ? (zh ? `最近运行 ${new Date(data.healthCheck.lastRunAt).toLocaleString(localeTag)}` : `Last run ${new Date(data.healthCheck.lastRunAt).toLocaleString(localeTag)}`) : (zh ? "尚未运行" : "Not run yet")}
            />
            <MetricCard label={zh ? "未处理问题" : "Open issues"} value={String(data.healthCheck.openIssues)} note={zh ? `平均健康分 ${data.healthCheck.averageHealthScore}` : `Average health ${data.healthCheck.averageHealthScore}`} />
            <MetricCard label={zh ? "机会数" : "Opportunities"} value={String(data.opportunities.total)} note={zh ? `${data.opportunities.new} 个新增` : `${data.opportunities.new} new`} />
            <MetricCard label={zh ? "草稿建议" : "Draft recommendations"} value={String(data.recommendations.draft)} note={zh ? `总计 ${data.recommendations.total}` : `${data.recommendations.total} total`} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
            <div className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "连接状态" : "Connections"}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ConnectionCard title="Google Search Console" status={data.searchConsole.status} zh={zh} />
                <ConnectionCard title="GA4 Data API" status={data.ga4.status} zh={zh} />
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "工作流约束" : "Workflow"}</p>
              <div className="mt-5 space-y-3 text-sm text-muted">
                <p>{zh ? "所有生成内容都会标记为 " : "All generated output is labeled "}<span className="font-bold text-graphite">AI Draft</span>.</p>
                <p>{zh ? "没有人工点击 " : "No SEO field changes are applied without a manual "}<span className="font-bold text-graphite">Apply</span>{zh ? " 之前，不会修改任何 SEO 字段。" : "."}</p>
                <p>{zh ? "没有人工点击 " : "No content is published without a manual "}<span className="font-bold text-graphite">Publish</span>{zh ? " 之前，不会发布任何内容。" : "."}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "AI 状态" : "AI Status"}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <DetailTile label={zh ? "配置 Provider" : "Configured provider"} value={data.aiStatus.configuredProvider} />
              <DetailTile label={zh ? "当前生效 Provider" : "Effective provider"} value={data.aiStatus.effectiveProvider} />
              <DetailTile label={zh ? "回退 Provider" : "Fallback provider"} value={data.aiStatus.fallbackProvider} />
              <DetailTile label={zh ? "模型" : "Model"} value={data.aiStatus.model ?? "-"} />
              <DetailTile label="Base URL" value={data.aiStatus.baseUrl ?? "-"} />
              <DetailTile label={zh ? "API Key 已配置" : "API key configured"} value={data.aiStatus.apiKeyConfigured ? (zh ? "是" : "Yes") : (zh ? "否" : "No")} />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "最近 SEO 变更" : "Recent SEO Changes"}</p>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    <th className="px-3 py-3">{zh ? "动作" : "Action"}</th>
                    <th className="px-3 py-3">{zh ? "资源" : "Resource"}</th>
                    <th className="px-3 py-3">{zh ? "资源 ID" : "Resource ID"}</th>
                    <th className="px-3 py-3">{zh ? "操作人" : "Operator"}</th>
                    <th className="px-3 py-3">{zh ? "创建时间" : "Created"}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentChanges.map((item) => (
                    <tr key={item.id} className="border-b border-graphite/5">
                      <td className="px-3 py-4 font-bold text-graphite">{item.action}</td>
                      <td className="px-3 py-4 text-muted">{item.resourceType}</td>
                      <td className="px-3 py-4 text-muted">{item.resourceId ?? "-"}</td>
                      <td className="px-3 py-4 text-muted">{item.operatorId ?? "-"}</td>
                      <td className="px-3 py-4 text-muted">{new Date(item.createdAt).toLocaleString(localeTag)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-3xl bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl font-black text-graphite">{value}</p>
      <p className="mt-3 text-sm text-muted">{note}</p>
    </div>
  );
}

function ConnectionCard({ title, status, zh }: { title: string; status: "Connected" | "Not Connected"; zh: boolean }) {
  return (
    <div className="rounded-2xl bg-warm p-4">
      <p className="text-sm font-bold text-graphite">{title}</p>
      <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${status === "Connected" ? "bg-lime text-graphite" : "bg-graphite text-white"}`}>
        {status === "Connected" ? (zh ? "已连接" : "Connected") : (zh ? "未连接" : "Not Connected")}
      </p>
    </div>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-warm p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-3 text-sm font-bold text-graphite break-all">{value}</p>
    </div>
  );
}
