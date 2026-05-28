"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listCommerceRuleSets,
  publishCommerceRuleSet,
  simulateCommerceQuote,
  upsertCommerceRuleSetDraft,
  validateCommerceRuleSetDraft,
  validateCommerceRuleSetById,
} from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { CommerceRuleSetSummary, UpsertCommerceRuleSetPayload } from "@/lib/admin-commerce-rules-types";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./admin-page-header";

const SIMULATE_INPUT_STORAGE_KEY = "admin-commerce-rules-simulate-input";
const defaultSimulateInput = {
  variantId: "",
  quantity: 1,
  country: "US",
  region: "",
  postalCode: "",
  currency: "usd",
};

const defaultPayload: UpsertCommerceRuleSetPayload = {
  name: "Default checkout ruleset",
  description: "Phase 0 baseline rules",
  taxRules: [
    { countryCode: "US", currency: "usd", taxMode: "EXCLUSIVE", rateBps: 850, priority: 100, enabled: true },
  ],
  shippingRules: [
    { countryCode: "US", currency: "usd", feeMode: "FREE_OVER_THRESHOLD", flatFeeMinor: 699, freeOverMinor: 6000, priority: 100, enabled: true },
  ],
  paymentRules: [
    { countryCode: "US", currency: "usd", method: "CARD", priority: 100, enabled: true },
    { countryCode: "US", currency: "usd", method: "APPLE_PAY", priority: 120, enabled: true },
  ],
};

export function AdminCommerceRulesPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [rulesets, setRulesets] = useState<CommerceRuleSetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draftJson, setDraftJson] = useState(JSON.stringify(defaultPayload, null, 2));
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);
  const [simulateResult, setSimulateResult] = useState<string>("");
  const [simulateInput, setSimulateInput] = useState(() => {
    if (typeof window === "undefined") return defaultSimulateInput;
    try {
      const raw = window.localStorage.getItem(SIMULATE_INPUT_STORAGE_KEY);
      if (!raw) return defaultSimulateInput;
      const parsed = JSON.parse(raw) as Partial<typeof defaultSimulateInput>;
      return {
        ...defaultSimulateInput,
        ...parsed,
        quantity: Math.max(1, Number(parsed.quantity ?? defaultSimulateInput.quantity) || 1),
      };
    } catch {
      return defaultSimulateInput;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SIMULATE_INPUT_STORAGE_KEY, JSON.stringify(simulateInput));
    } catch {
      // Ignore write failures (private mode / quota).
    }
  }, [simulateInput]);

  async function reload() {
    setLoading(true);
    try {
      const data = await listCommerceRuleSets();
      setRulesets(data);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "加载规则集失败" : "Failed to load rule sets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const active = useMemo(() => rulesets.find((item) => item.status === "ACTIVE") ?? null, [rulesets]);

  function parseDraft() {
    return JSON.parse(draftJson) as UpsertCommerceRuleSetPayload;
  }

  async function saveDraft() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = parseDraft();
      await upsertCommerceRuleSetDraft(payload);
      setSuccess(zh ? "草稿规则已保存" : "Draft rules saved");
      await reload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "保存草稿失败" : "Failed to save draft");
    } finally {
      setBusy(false);
    }
  }

  async function validateDraft() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = parseDraft();
      const result = await validateCommerceRuleSetDraft(payload);
      setValidation(result);
      setSuccess(result.valid ? (zh ? "校验通过" : "Validation passed") : (zh ? "校验发现问题" : "Validation found issues"));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "校验失败" : "Validation failed");
    } finally {
      setBusy(false);
    }
  }

  async function publish(id: string) {
    if (!window.confirm(zh ? "确认发布该规则集并替换当前 active 吗？" : "Publish this rule set as active?")) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const check = await validateCommerceRuleSetById(id);
      setValidation(check);
      if (!check.valid) {
        setError(zh ? "规则集校验未通过，已阻止发布" : "Rule set validation failed; publish blocked");
        return;
      }
      await publishCommerceRuleSet(id);
      setSuccess(zh ? "规则集已发布" : "Rule set published");
      await reload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "发布失败" : "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  async function simulate() {
    if (!simulateInput.variantId.trim()) {
      setError(zh ? "请先输入 variantId" : "Please enter variantId");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await simulateCommerceQuote({
        items: [{ variantId: simulateInput.variantId.trim(), quantity: simulateInput.quantity }],
        country: simulateInput.country || undefined,
        region: simulateInput.region || undefined,
        postalCode: simulateInput.postalCode || undefined,
        currency: simulateInput.currency || undefined,
      });
      setSimulateResult(JSON.stringify(result, null, 2));
      setSuccess(zh ? "模拟成功" : "Simulation succeeded");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "模拟失败" : "Simulation failed");
    } finally {
      setBusy(false);
    }
  }

  function resetSimulateInput() {
    setSimulateInput(defaultSimulateInput);
    try {
      window.localStorage.removeItem(SIMULATE_INPUT_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={zh ? "结账规则" : "Checkout Rules"}
        title={zh ? "交易规则引擎" : "Commerce Rules Engine"}
        body={zh ? "管理税费、运费和支付方式规则，支持草稿校验、发布与报价模拟。" : "Manage tax, shipping and payment rules with draft validation, publish and quote simulation."}
      />

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-bold text-emerald-700">{success}</p> : null}

      <section className="rounded-3xl bg-white p-6 shadow-utility">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-black uppercase tracking-[-0.04em] text-graphite">{zh ? "规则集状态" : "Rule sets"}</h2>
          <div className="text-sm text-muted">
            {active ? (zh ? `当前 Active：v${active.version} - ${active.name}` : `Active: v${active.version} - ${active.name}`) : (zh ? "暂无 Active 规则集" : "No active rule set")}
          </div>
        </div>
        {loading ? <p className="mt-3 text-sm text-muted">{zh ? "加载中..." : "Loading..."}</p> : (
          <div className="mt-4 grid gap-3">
            {rulesets.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-graphite/10 p-4">
                <div>
                  <p className="font-bold text-graphite">{item.name} · v{item.version}</p>
                  <p className="text-xs text-muted">{item.status} · {new Date(item.updatedAt).toLocaleString()}</p>
                </div>
                <Button disabled={busy} variant={item.status === "ACTIVE" ? "outline" : "lime"} onClick={() => void publish(item.id)}>
                  {item.status === "ACTIVE" ? (zh ? "已生效" : "Active") : (zh ? "发布为 Active" : "Publish Active")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-utility">
          <h3 className="font-display text-xl font-black uppercase tracking-[-0.03em] text-graphite">{zh ? "草稿编辑（JSON）" : "Draft editor (JSON)"}</h3>
          <textarea
            value={draftJson}
            onChange={(event) => setDraftJson(event.target.value)}
            className="mt-4 min-h-[420px] w-full rounded-2xl border border-graphite/10 bg-warm px-4 py-3 font-mono text-xs outline-none"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button disabled={busy} variant="outline" onClick={() => void validateDraft()}>{zh ? "校验草稿" : "Validate Draft"}</Button>
            <Button disabled={busy} variant="lime" onClick={() => void saveDraft()}>{zh ? "保存草稿" : "Save Draft"}</Button>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-utility">
            <h3 className="font-display text-xl font-black uppercase tracking-[-0.03em] text-graphite">{zh ? "校验结果" : "Validation Result"}</h3>
            {validation ? (
              <div className="mt-4 space-y-3 text-sm">
                <p className={validation.valid ? "font-bold text-emerald-700" : "font-bold text-red-700"}>
                  {validation.valid ? (zh ? "通过" : "Valid") : (zh ? "未通过" : "Invalid")}
                </p>
                <div>
                  <p className="font-bold text-graphite">{zh ? "错误" : "Errors"}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-red-700">
                    {validation.errors.length ? validation.errors.map((line) => <li key={line}>{line}</li>) : <li>{zh ? "无" : "None"}</li>}
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-graphite">{zh ? "警告" : "Warnings"}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-700">
                    {validation.warnings.length ? validation.warnings.map((line) => <li key={line}>{line}</li>) : <li>{zh ? "无" : "None"}</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">{zh ? "先执行一次校验。" : "Run validation first."}</p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-utility">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-black uppercase tracking-[-0.03em] text-graphite">{zh ? "报价模拟" : "Quote Simulation"}</h3>
              <div className="flex items-center gap-2">
                <Button disabled={busy} variant="outline" onClick={resetSimulateInput}>{zh ? "重置" : "Reset"}</Button>
                <Button disabled={busy} variant="outline" onClick={() => void simulate()}>{zh ? "执行模拟" : "Run Simulation"}</Button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">variantId</span>
                <input
                  value={simulateInput.variantId}
                  onChange={(event) => setSimulateInput((current) => ({ ...current, variantId: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
                  placeholder="var_xxx"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{zh ? "数量" : "Quantity"}</span>
                <input
                  type="number"
                  min={1}
                  value={simulateInput.quantity}
                  onChange={(event) => setSimulateInput((current) => ({ ...current, quantity: Math.max(1, Number(event.target.value) || 1) }))}
                  className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{zh ? "国家" : "Country"}</span>
                <input
                  value={simulateInput.country}
                  onChange={(event) => setSimulateInput((current) => ({ ...current, country: event.target.value.toUpperCase() }))}
                  className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
                  placeholder="US"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{zh ? "地区" : "Region"}</span>
                <input
                  value={simulateInput.region}
                  onChange={(event) => setSimulateInput((current) => ({ ...current, region: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
                  placeholder="CA"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{zh ? "邮编" : "Postal Code"}</span>
                <input
                  value={simulateInput.postalCode}
                  onChange={(event) => setSimulateInput((current) => ({ ...current, postalCode: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
                  placeholder="94105"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{zh ? "币种" : "Currency"}</span>
                <input
                  value={simulateInput.currency}
                  onChange={(event) => setSimulateInput((current) => ({ ...current, currency: event.target.value.toLowerCase() }))}
                  className="mt-2 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
                  placeholder="usd"
                />
              </label>
            </div>
            <pre className="mt-4 max-h-[280px] overflow-auto rounded-2xl border border-graphite/10 bg-warm p-4 text-xs text-graphite">
              {simulateResult || (zh ? "暂无模拟结果" : "No simulation output yet")}
            </pre>
          </section>
        </div>
      </section>
    </div>
  );
}
