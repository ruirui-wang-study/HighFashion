"use client";

import { useEffect, useState } from "react";
import {
  activateProductResearchScoringRule,
  createProductResearchScoringRule,
  getProductResearchDecisions,
  getProductResearchImportBatches,
  getProductResearchScoringRules,
  getProductResearchSuppliers,
  getProductResearchTestLaunches,
} from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type {
  ProductResearchDecisionListItem,
  ProductResearchImportBatch,
  ProductResearchScoringRule,
  ProductResearchSupplier,
  ProductResearchTestLaunch,
} from "@/lib/product-research-types";
import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";

const defaultWeights = {
  marketDemand: 0.15,
  trendSeasonality: 0.1,
  competitionGap: 0.1,
  marginPotential: 0.15,
  logisticsFit: 0.1,
  brandability: 0.15,
  supplierQuality: 0.1,
  riskInverse: 0.1,
  testability: 0.05,
};

export function AdminProductResearchSuppliersPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ProductResearchSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProductResearchSuppliers()
      .then((result) => {
        if (!active) return;
        setItems(result);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载供应商失败" : "Failed to load suppliers");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [zh]);

  return (
    <AdminProductResearchSectionShell eyebrow={zh ? "研究" : "Research"} title={zh ? "供应商" : "Suppliers"} body={zh ? "用供应商库比较报价质量、MOQ 和物流适配，再决定是否推进打样或测试。" : "Use the supplier library to compare quote quality, MOQ, and logistics fit before committing to samples or tests."}>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载供应商..." : "Loading suppliers..."}</section> : null}
      {!loading ? (
        <section className="rounded-3xl bg-white p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{zh ? "供应商" : "Supplier"}</th>
                  <th className="px-3 py-3">{zh ? "平台" : "Platform"}</th>
                  <th className="px-3 py-3">MOQ</th>
                  <th className="px-3 py-3">{zh ? "单价" : "Unit"}</th>
                  <th className="px-3 py-3">{zh ? "交期" : "Lead Time"}</th>
                  <th className="px-3 py-3">{zh ? "美国运费" : "US Ship"}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={6} className="px-3 py-8 text-center text-muted">{zh ? "还没有供应商。" : "No suppliers yet."}</td></tr> : null}
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-graphite/5">
                    <td className="px-3 py-4">
                      <p className="font-bold text-graphite">{item.name}</p>
                      <p className="mt-1 text-xs text-muted">{item.country ?? (zh ? "国家待补充" : "Country pending")} / {item.verifiedSupplier ? (zh ? "已认证" : "Verified") : (zh ? "未认证" : "Unverified")}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{item.platform}</td>
                    <td className="px-3 py-4 text-muted">{item.moq ?? "-"}</td>
                    <td className="px-3 py-4 text-muted">{item.unitPriceCents != null ? formatCents(item.unitPriceCents) : "-"}</td>
                    <td className="px-3 py-4 text-muted">{item.leadTimeDays != null ? (zh ? `${item.leadTimeDays} 天` : `${item.leadTimeDays} days`) : "-"}</td>
                    <td className="px-3 py-4 text-muted">{item.shippingToUSCents != null ? formatCents(item.shippingToUSCents) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </AdminProductResearchSectionShell>
  );
}

export function AdminProductResearchScoringRulesPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ProductResearchScoringRule[]>([]);
  const [version, setVersion] = useState("");
  const [weights, setWeights] = useState(JSON.stringify(defaultWeights, null, 2));
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRules() {
    const result = await getProductResearchScoringRules();
    setItems(result);
  }

  useEffect(() => {
    let active = true;
    getProductResearchScoringRules()
      .then((result) => {
        if (!active) return;
        setItems(result);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载评分规则失败" : "Failed to load scoring rules");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [zh]);

  async function createRule() {
    setBusy("create");
    setError(null);
    try {
      const parsed = JSON.parse(weights) as Record<string, number>;
      await createProductResearchScoringRule({ version, weights: parsed });
      setVersion("");
      await loadRules();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "创建评分规则失败" : "Failed to create scoring rule");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminProductResearchSectionShell eyebrow={zh ? "研究" : "Research"} title={zh ? "评分规则" : "Scoring Rules"} body={zh ? "评分规则保持版本化，方便追溯某个候选品在某个时间为何得到该分数。" : "Scoring rules stay versioned so operators can trace why a candidate was scored a certain way at a certain point in time."}>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载评分规则..." : "Loading scoring rules..."}</section> : null}
      {!loading ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-3xl bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "现有规则" : "Existing Rules"}</p>
            <div className="mt-4 space-y-3">
              {items.length === 0 ? <p className="text-sm text-muted">{zh ? "还没有评分规则。" : "No scoring rules yet."}</p> : null}
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl bg-warm p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-graphite">{item.version}</p>
                      <p className="mt-1 text-sm text-muted">{new Date(item.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={item.isActive ? "lime" : "outline"}
                      disabled={busy === item.id || item.isActive}
                      onClick={() => {
                        if (
                          !window.confirm(
                            zh
                              ? `确认启用评分规则 ${item.version} 吗？将按新权重重算全部候选品分数。`
                              : `Activate scoring rule ${item.version}? All candidate scores will be recalculated with the new weights.`,
                          )
                        ) {
                          return;
                        }
                        setBusy(item.id);
                        void activateProductResearchScoringRule(item.id, { recalculateExisting: true })
                          .then((result) => {
                            if (result.recalculated > 0) {
                              window.alert(
                                zh
                                  ? `已启用 ${item.version}，并重算了 ${result.recalculated} 个候选品。`
                                  : `Activated ${item.version} and recalculated ${result.recalculated} candidates.`,
                              );
                            }
                            return loadRules();
                          })
                          .catch((nextError) => setError(nextError instanceof Error ? nextError.message : zh ? "启用规则失败" : "Failed to activate rule"))
                          .finally(() => setBusy(null));
                      }}
                    >
                      {item.isActive ? (zh ? "已启用" : "Active") : (zh ? "启用" : "Activate")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "新规则" : "New Rule"}</p>
            <div className="mt-4 space-y-3">
              <input value={version} onChange={(event) => setVersion(event.target.value)} className="w-full rounded-2xl border border-graphite/10 px-4 py-3 outline-none" placeholder={zh ? "版本号，例如 v2026-05-25" : "Version, e.g. v2026-05-25"} />
              <textarea value={weights} onChange={(event) => setWeights(event.target.value)} className="min-h-64 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
              <Button className="w-full" variant="lime" disabled={busy === "create" || !version.trim()} onClick={() => void createRule()}>
                {busy === "create" ? (zh ? "创建中..." : "Creating...") : (zh ? "创建规则" : "Create Rule")}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </AdminProductResearchSectionShell>
  );
}

export function AdminProductResearchImportBatchesPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ProductResearchImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProductResearchImportBatches()
      .then((result) => {
        if (!active) return;
        setItems(result);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载导入批次失败" : "Failed to load import batches");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [zh]);

  return (
    <AdminProductResearchSectionShell eyebrow={zh ? "研究" : "Research"} title={zh ? "导入批次" : "Import Batches"} body={zh ? "每个导入批次都应该可解释：来源、行数、重复率和操作人。" : "Every import batch should be explainable: source, row counts, duplicate rate, and operator."}>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载导入批次..." : "Loading import batches..."}</section> : null}
      {!loading ? (
        <section className="rounded-3xl bg-white p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{zh ? "来源" : "Source"}</th>
                  <th className="px-3 py-3">{zh ? "文件" : "File"}</th>
                  <th className="px-3 py-3">{zh ? "行数" : "Rows"}</th>
                  <th className="px-3 py-3">{zh ? "创建时间" : "Created"}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={4} className="px-3 py-8 text-center text-muted">{zh ? "还没有导入批次。" : "No import batches yet."}</td></tr> : null}
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-graphite/5">
                    <td className="px-3 py-4 font-bold text-graphite">{item.source}</td>
                    <td className="px-3 py-4 text-muted">{item.fileName ?? "-"}</td>
                    <td className="px-3 py-4 text-muted">{zh ? `${item.createdCount}/${item.totalRows} 已创建 / ${item.duplicateCount} 重复` : `${item.createdCount}/${item.totalRows} created / ${item.duplicateCount} dup`}</td>
                    <td className="px-3 py-4 text-muted">{new Date(item.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </AdminProductResearchSectionShell>
  );
}

export function AdminProductResearchDecisionsPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ProductResearchDecisionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProductResearchDecisions()
      .then((result) => {
        if (!active) return;
        setItems(result);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载决策记录失败" : "Failed to load decisions");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [zh]);

  return (
    <AdminProductResearchSectionShell eyebrow={zh ? "研究" : "Research"} title={zh ? "决策记录" : "Decisions"} body={zh ? "决策历史为选品和运营提供清晰的审计轨迹，覆盖打样、测试、批准、拒绝和转换操作。" : "Decision history gives merchandising and operations a clean audit trail for sample, test, approve, reject, and convert calls."}>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载决策记录..." : "Loading decisions..."}</section> : null}
      {!loading ? (
        <section className="rounded-3xl bg-white p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{zh ? "候选品" : "Candidate"}</th>
                  <th className="px-3 py-3">{zh ? "决策" : "Decision"}</th>
                  <th className="px-3 py-3">{zh ? "操作人" : "Operator"}</th>
                  <th className="px-3 py-3">{zh ? "创建时间" : "Created"}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={4} className="px-3 py-8 text-center text-muted">{zh ? "还没有决策记录。" : "No decisions yet."}</td></tr> : null}
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-graphite/5">
                    <td className="px-3 py-4"><p className="font-bold text-graphite">{item.candidate.productName}</p><p className="mt-1 text-xs text-muted">{item.candidate.status}</p></td>
                    <td className="px-3 py-4 text-muted">{item.decision}</td>
                    <td className="px-3 py-4 text-muted">{item.operator?.email ?? "-"}</td>
                    <td className="px-3 py-4 text-muted">{new Date(item.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </AdminProductResearchSectionShell>
  );
}

export function AdminProductResearchTestLaunchesPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [items, setItems] = useState<ProductResearchTestLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProductResearchTestLaunches()
      .then((result) => {
        if (!active) return;
        setItems(result);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : zh ? "加载测试记录失败" : "Failed to load test launches");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [zh]);

  return (
    <AdminProductResearchSectionShell eyebrow={zh ? "研究" : "Research"} title={zh ? "测试记录" : "Test Launches"} body={zh ? "在验证备货决策或将候选品升级为正式库存商品前，先跟踪投放花费和站内信号。" : "Track spend and on-site signals before validating inventory decisions or escalating a candidate into a stocked product line."}>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <section className="rounded-3xl bg-white p-6 text-sm text-muted">{zh ? "正在加载测试记录..." : "Loading test launches..."}</section> : null}
      {!loading ? (
        <section className="rounded-3xl bg-white p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{zh ? "候选品" : "Candidate"}</th>
                  <th className="px-3 py-3">{zh ? "渠道" : "Channel"}</th>
                  <th className="px-3 py-3">{zh ? "浏览" : "Views"}</th>
                  <th className="px-3 py-3">ATC</th>
                  <th className="px-3 py-3">{zh ? "购买" : "Purchases"}</th>
                  <th className="px-3 py-3">{zh ? "收入" : "Revenue"}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={6} className="px-3 py-8 text-center text-muted">{zh ? "还没有测试记录。" : "No test launches yet."}</td></tr> : null}
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-graphite/5">
                    <td className="px-3 py-4"><p className="font-bold text-graphite">{item.candidate.productName}</p><p className="mt-1 text-xs text-muted">{item.status}</p></td>
                    <td className="px-3 py-4 text-muted">{item.channel}</td>
                    <td className="px-3 py-4 text-muted">{item.productViews}</td>
                    <td className="px-3 py-4 text-muted">{item.addToCart}</td>
                    <td className="px-3 py-4 text-muted">{item.purchases}</td>
                    <td className="px-3 py-4 text-muted">{formatCents(item.revenueCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </AdminProductResearchSectionShell>
  );
}
