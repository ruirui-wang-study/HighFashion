"use client";

import { useEffect, useState } from "react";
import {
  createAdminGeoPrompt,
  createAdminGeoRecommendation,
  createAdminGeoResult,
  getAdminGeoCompetitors,
  getAdminGeoPrompts,
  getAdminGeoRecommendations,
  getAdminGeoResults,
  getAdminGeoSummary,
} from "@/lib/admin-api";
import type { GeoDashboardSummary, GeoPlatform, GeoPrompt, GeoRecommendation, GeoTestRun } from "@/lib/admin-geo-types";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./admin-page-header";

export function AdminGeoPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [summary, setSummary] = useState<GeoDashboardSummary | null>(null);
  const [prompts, setPrompts] = useState<GeoPrompt[]>([]);
  const [results, setResults] = useState<GeoTestRun[]>([]);
  const [recommendations, setRecommendations] = useState<GeoRecommendation[]>([]);
  const [competitors, setCompetitors] = useState<Array<{ brand: string; count: number }>>([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [runForm, setRunForm] = useState({
    platform: "CHATGPT" as GeoPlatform,
    prompt: "",
    mentionedBrands: "",
    citedUrls: "",
    competitorBrands: "",
    whetherPulseGearMentioned: false,
    whetherPulseGearCited: false,
    notes: "",
  });
  const [recForm, setRecForm] = useState({
    query: "",
    pagePath: "",
    recommendationType: "DIRECT_ANSWER",
    recommendation: "",
    priority: "MEDIUM",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function reload() {
    const [summaryData, promptData, resultData, recData, competitorData] = await Promise.all([
      getAdminGeoSummary(),
      getAdminGeoPrompts(),
      getAdminGeoResults(),
      getAdminGeoRecommendations(),
      getAdminGeoCompetitors(),
    ]);
    setSummary(summaryData);
    setPrompts(promptData);
    setResults(resultData);
    setRecommendations(recData);
    setCompetitors(competitorData);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload().catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Failed to load GEO data"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function addPrompt() {
    if (!newPrompt.trim()) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await createAdminGeoPrompt({ prompt: newPrompt.trim() });
      setNewPrompt("");
      setSuccess(zh ? "Prompt 已新增" : "Prompt added");
      await reload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "新增 prompt 失败" : "Failed to add prompt");
    } finally {
      setBusy(false);
    }
  }

  async function addResult() {
    if (!runForm.prompt.trim()) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await createAdminGeoResult({
        platform: runForm.platform,
        prompt: runForm.prompt.trim(),
        mentionedBrands: splitCsv(runForm.mentionedBrands),
        citedUrls: splitCsv(runForm.citedUrls),
        competitorBrands: splitCsv(runForm.competitorBrands),
        whetherPulseGearMentioned: runForm.whetherPulseGearMentioned,
        whetherPulseGearCited: runForm.whetherPulseGearCited,
        notes: runForm.notes.trim() || undefined,
      });
      setSuccess(zh ? "测试结果已记录" : "Test result recorded");
      setRunForm((current) => ({ ...current, prompt: "", mentionedBrands: "", citedUrls: "", competitorBrands: "", notes: "" }));
      await reload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "记录失败" : "Failed to record result");
    } finally {
      setBusy(false);
    }
  }

  async function addRecommendation() {
    if (!recForm.recommendation.trim()) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await createAdminGeoRecommendation({
        query: recForm.query || undefined,
        pagePath: recForm.pagePath || undefined,
        recommendationType: recForm.recommendationType,
        recommendation: recForm.recommendation.trim(),
        priority: recForm.priority,
      });
      setSuccess(zh ? "建议已保存" : "Recommendation saved");
      setRecForm((current) => ({ ...current, recommendation: "" }));
      await reload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "保存建议失败" : "Failed to save recommendation");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={zh ? "GEO" : "GEO"}
        title={zh ? "AI 引擎可见度监测" : "Generative Engine Optimization"}
        body={zh ? "跟踪 ChatGPT、Perplexity、Gemini、Google AI Overview 对品牌提及与引用表现。" : "Track brand mentions and citations across ChatGPT, Perplexity, Gemini, and Google AI Overview."}
      />

      {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
      {success ? <p className="text-sm font-bold text-emerald-700">{success}</p> : null}

      <section className="grid gap-3 md:grid-cols-4">
        <CardStat label={zh ? "活跃 Prompts" : "Active prompts"} value={String(summary?.totalPrompts ?? 0)} />
        <CardStat label={zh ? "总测试数" : "Total runs"} value={String(summary?.totalRuns ?? 0)} />
        <CardStat label={zh ? "提到 PulseGear" : "PulseGear mentioned"} value={String(summary?.pulseMentionedRuns ?? 0)} />
        <CardStat label={zh ? "引用 PulseGear" : "PulseGear cited"} value={String(summary?.pulseCitedRuns ?? 0)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-utility">
          <h3 className="font-display text-xl font-black uppercase tracking-[-0.03em] text-graphite">{zh ? "Prompts 管理" : "Prompts"}</h3>
          <div className="mt-4 flex gap-2">
            <input value={newPrompt} onChange={(event) => setNewPrompt(event.target.value)} className="w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <Button disabled={busy} variant="lime" onClick={() => void addPrompt()}>{zh ? "新增" : "Add"}</Button>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {prompts.map((item) => <div key={item.id} className="rounded-2xl bg-warm px-4 py-3">{item.prompt}</div>)}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-utility">
          <h3 className="font-display text-xl font-black uppercase tracking-[-0.03em] text-graphite">{zh ? "录入测试结果" : "Record run result"}</h3>
          <div className="mt-4 grid gap-3">
            <input value={runForm.prompt} onChange={(event) => setRunForm((current) => ({ ...current, prompt: event.target.value }))} placeholder="prompt" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <select value={runForm.platform} onChange={(event) => setRunForm((current) => ({ ...current, platform: event.target.value as GeoPlatform }))} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
              <option value="CHATGPT">ChatGPT</option><option value="PERPLEXITY">Perplexity</option><option value="GEMINI">Gemini</option><option value="GOOGLE_AI_OVERVIEW">Google AI Overview</option>
            </select>
            <input value={runForm.mentionedBrands} onChange={(event) => setRunForm((current) => ({ ...current, mentionedBrands: event.target.value }))} placeholder={zh ? "mentionedBrands（逗号分隔）" : "mentionedBrands (csv)"} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <input value={runForm.citedUrls} onChange={(event) => setRunForm((current) => ({ ...current, citedUrls: event.target.value }))} placeholder={zh ? "citedUrls（逗号分隔）" : "citedUrls (csv)"} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <input value={runForm.competitorBrands} onChange={(event) => setRunForm((current) => ({ ...current, competitorBrands: event.target.value }))} placeholder={zh ? "competitorBrands（逗号分隔）" : "competitorBrands (csv)"} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <label className="text-sm"><input type="checkbox" checked={runForm.whetherPulseGearMentioned} onChange={(event) => setRunForm((current) => ({ ...current, whetherPulseGearMentioned: event.target.checked }))} className="mr-2" />{zh ? "提到 PulseGear" : "PulseGear mentioned"}</label>
            <label className="text-sm"><input type="checkbox" checked={runForm.whetherPulseGearCited} onChange={(event) => setRunForm((current) => ({ ...current, whetherPulseGearCited: event.target.checked }))} className="mr-2" />{zh ? "引用 PulseGear 页面" : "PulseGear cited"}</label>
            <textarea value={runForm.notes} onChange={(event) => setRunForm((current) => ({ ...current, notes: event.target.value }))} placeholder={zh ? "备注" : "Notes"} className="min-h-20 rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <Button disabled={busy} variant="lime" onClick={() => void addResult()}>{zh ? "保存结果" : "Save result"}</Button>
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-utility">
          <h3 className="font-display text-xl font-black uppercase tracking-[-0.03em] text-graphite">{zh ? "推荐动作" : "Recommendations"}</h3>
          <div className="mt-4 grid gap-3">
            <input value={recForm.query} onChange={(event) => setRecForm((current) => ({ ...current, query: event.target.value }))} placeholder="query" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <input value={recForm.pagePath} onChange={(event) => setRecForm((current) => ({ ...current, pagePath: event.target.value }))} placeholder="pagePath" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <input value={recForm.recommendationType} onChange={(event) => setRecForm((current) => ({ ...current, recommendationType: event.target.value }))} placeholder="recommendationType" className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <textarea value={recForm.recommendation} onChange={(event) => setRecForm((current) => ({ ...current, recommendation: event.target.value }))} placeholder={zh ? "建议内容" : "Recommendation"} className="min-h-24 rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            <Button disabled={busy} variant="lime" onClick={() => void addRecommendation()}>{zh ? "新增建议" : "Create recommendation"}</Button>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {recommendations.slice(0, 10).map((item) => <div key={item.id} className="rounded-2xl bg-warm px-4 py-3">{item.recommendationType} · {item.recommendation}</div>)}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-utility">
          <h3 className="font-display text-xl font-black uppercase tracking-[-0.03em] text-graphite">{zh ? "竞争品牌与近期结果" : "Competitors and recent runs"}</h3>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {competitors.map((item) => <span key={item.brand} className="rounded-full bg-warm px-3 py-1">{item.brand} ({item.count})</span>)}
          </div>
          <div className="mt-4 max-h-[320px] space-y-2 overflow-auto">
            {results.slice(0, 20).map((item) => (
              <div key={item.id} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm">
                <p className="font-bold">{item.platform} · {new Date(item.createdAt).toLocaleString()}</p>
                <p className="mt-1 text-muted">{item.promptText}</p>
                <p className="mt-1 text-xs">{zh ? "提到" : "Mentioned"}: {item.whetherPulseGearMentioned ? "Yes" : "No"} · {zh ? "引用" : "Cited"}: {item.whetherPulseGearCited ? "Yes" : "No"}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-utility">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl font-black tracking-[-0.05em] text-graphite">{value}</p>
    </div>
  );
}
