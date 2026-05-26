"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import {
  commitProductResearchAiImport,
  commitProductResearchAlibabaImport,
  commitProductResearchCsvImport,
  commitProductResearchSupplierQuoteImport,
  previewProductResearchAiImport,
  previewProductResearchAlibabaImport,
  previewProductResearchCsvImport,
  previewProductResearchSupplierQuoteImport,
} from "@/lib/admin-api";
import { useLocale } from "@/components/locale-provider";
import type { ProductResearchImportPreview } from "@/lib/product-research-types";
import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";
import { Button } from "@/components/ui/button";

export function AdminProductResearchAiImportPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [brandDirection, setBrandDirection] = useState("performance utility accessories for running and court sports");
  const [targetMarket, setTargetMarket] = useState("US");
  const [excludedCategories, setExcludedCategories] = useState("medical, helmets, supplements");
  const [count, setCount] = useState("6");
  const [preview, setPreview] = useState<ProductResearchImportPreview | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState<"preview" | "commit" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);

  async function runPreview() {
    setBusy("preview");
    setError(null);
    setMessage(null);
    try {
      const result = await previewProductResearchAiImport({
        brandDirection,
        targetMarket,
        excludedCategories: excludedCategories.split(",").map((item) => item.trim()).filter(Boolean),
        count: Number(count || 6),
      });
      setPreview(result);
      setSelected((result.items ?? []).map((_, index) => index));
      requestAnimationFrame(() => {
        previewPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "AI 候选品预览失败" : "Failed to preview AI candidates");
    } finally {
      setBusy(null);
    }
  }

  async function runCommit() {
    if (!preview?.items?.length || selected.length === 0) return;
    if (!window.confirm(zh ? `确认导入 ${selected.length} 个 AI 候选品吗？` : `Import ${selected.length} AI-generated candidates?`)) return;
    setBusy("commit");
    setError(null);
    setMessage(null);
    try {
      const result = await commitProductResearchAiImport({
        previewItems: preview.items as Array<Record<string, unknown>>,
        selectedIndexes: selected,
      });
      setMessage(zh ? `已导入 ${result.importedCount} 个候选品。重复 ${result.duplicateCount}，跳过 ${result.skippedCount}。` : `Imported ${result.importedCount} candidates. Duplicates: ${result.duplicateCount}. Skipped: ${result.skippedCount}.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "AI 候选品导入失败" : "Failed to commit AI candidates");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminProductResearchSectionShell eyebrow={zh ? "研究" : "Research"} title={zh ? "AI 候选品导入" : "AI Candidate Import"} body={zh ? "生成候选品草稿，检查重复项和风险提醒，然后只导入通过人工复核的行。" : "Generate draft candidates, inspect duplicates and risk warnings, then commit only the rows that survive manual review."}>
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl bg-white p-6">
          <div className="space-y-3">
            <Field label={zh ? "品牌方向" : "Brand direction"}>
              <textarea value={brandDirection} onChange={(event) => setBrandDirection(event.target.value)} className="min-h-32 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            </Field>
            <Field label={zh ? "目标市场" : "Target market"}>
              <input value={targetMarket} onChange={(event) => setTargetMarket(event.target.value)} className="w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            </Field>
            <Field label={zh ? "排除品类" : "Excluded categories"}>
              <input value={excludedCategories} onChange={(event) => setExcludedCategories(event.target.value)} className="w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            </Field>
            <Field label={zh ? "候选品数量" : "Candidate count"}>
              <input value={count} onChange={(event) => setCount(event.target.value)} type="number" min="1" max="20" className="w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
            </Field>
          </div>
          <Button className="mt-5 w-full" variant="lime" disabled={busy !== null} onClick={() => void runPreview()}>
            {busy === "preview" ? (zh ? "生成中..." : "Generating...") : (zh ? "生成预览" : "Generate Preview")}
          </Button>
        </div>
        <div ref={previewPanelRef}>
        <ImportPreviewPanel
          preview={preview}
          selected={selected}
          onToggle={setSelected}
          onCommit={() => void runCommit()}
          commitLabel={busy === "commit" ? (zh ? "导入中..." : "Importing...") : (zh ? "导入所选" : "Import Selected")}
          busy={busy === "commit"}
          error={error}
          message={message}
          emptyMessage={zh ? "还没有 AI 预览。" : "No AI preview yet."}
          itemSource="items"
        />
        </div>
      </section>
    </AdminProductResearchSectionShell>
  );
}

export function AdminProductResearchCsvImportPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [mode, setMode] = useState<"candidates" | "supplier_quotes">("candidates");
  const [fileName, setFileName] = useState<string | undefined>();
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [preview, setPreview] = useState<ProductResearchImportPreview | null>(null);
  const [action, setAction] = useState<"merge" | "skip" | "create_anyway">("skip");
  const [busy, setBusy] = useState<"preview" | "commit" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setFileName(file.name);
    setRows(parseCsv(text));
    setPreview(null);
    setMessage(null);
    setError(null);
  }

  async function runPreview() {
    setBusy("preview");
    setError(null);
    setMessage(null);
    try {
      const result = mode === "candidates"
        ? await previewProductResearchCsvImport({ fileName, rows })
        : await previewProductResearchSupplierQuoteImport({ fileName, rows });
      setPreview(result);
      requestAnimationFrame(() => {
        previewPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "CSV 预览失败" : "Failed to preview CSV");
    } finally {
      setBusy(null);
    }
  }

  async function runCommit() {
    if (!rows.length) return;
    if (!window.confirm(zh ? `确认导入 ${rows.length} 行 CSV 吗？` : `Commit ${rows.length} CSV rows as ${mode === "candidates" ? "candidate" : "supplier quote"} import?`)) return;
    setBusy("commit");
    setError(null);
    setMessage(null);
    try {
      const result = mode === "candidates"
        ? await commitProductResearchCsvImport({ batchId: fileName, rows, action })
        : await commitProductResearchSupplierQuoteImport({ batchId: fileName, rows, action });
      setMessage(zh ? `已导入 ${result.importedCount} 行。重复 ${result.duplicateCount}，跳过 ${result.skippedCount}。` : `Imported ${result.importedCount} rows. Duplicates: ${result.duplicateCount}. Skipped: ${result.skippedCount}.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "CSV 导入失败" : "Failed to commit CSV");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminProductResearchSectionShell eyebrow={zh ? "研究" : "Research"} title={zh ? "CSV 导入" : "CSV Import"} body={zh ? "预览候选品或供应商报价 CSV，检查无效行和重复项，再决定导入前的处理方式。" : "Preview candidate or supplier quote CSV files, review invalid rows and duplicates, then choose how to handle overlap before commit."}>
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl bg-white p-6">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-warm p-1">
            <button className={`rounded-2xl px-4 py-3 text-sm font-semibold ${mode === "candidates" ? "bg-white text-graphite" : "text-muted"}`} onClick={() => setMode("candidates")}>{zh ? "候选品" : "Candidates"}</button>
            <button className={`rounded-2xl px-4 py-3 text-sm font-semibold ${mode === "supplier_quotes" ? "bg-white text-graphite" : "text-muted"}`} onClick={() => setMode("supplier_quotes")}>{zh ? "供应商报价" : "Supplier Quotes"}</button>
          </div>
          <div className="mt-4 space-y-3">
            <input type="file" accept=".csv,text/csv" onChange={(event) => void onFileChange(event)} />
            <select value={action} onChange={(event) => setAction(event.target.value as "merge" | "skip" | "create_anyway")} className="w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
              <option value="skip">{zh ? "跳过重复项" : "Skip duplicates"}</option>
              <option value="merge">{zh ? "合并重复项" : "Merge duplicates"}</option>
              <option value="create_anyway">{zh ? "仍然创建" : "Create anyway"}</option>
            </select>
            <div className="rounded-2xl bg-warm px-4 py-3 text-sm text-muted">
              {rows.length > 0 ? (zh ? `已从 ${fileName} 解析 ${rows.length} 行` : `${rows.length} parsed rows from ${fileName}`) : (zh ? "请选择使用文档模板列的 CSV 文件。" : "Choose a CSV file using the documented template columns.")}
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button className="flex-1" variant="outline" disabled={busy !== null || rows.length === 0} onClick={() => void runPreview()}>
              {busy === "preview" ? (zh ? "预览中..." : "Previewing...") : (zh ? "预览" : "Preview")}
            </Button>
            <Button className="flex-1" variant="lime" disabled={busy !== null || rows.length === 0} onClick={() => void runCommit()}>
              {busy === "commit" ? (zh ? "导入中..." : "Importing...") : (zh ? "提交导入" : "Commit")}
            </Button>
          </div>
        </div>
        <div ref={previewPanelRef}>
          <CsvPreviewPanel preview={preview} error={error} message={message} />
        </div>
      </section>
    </AdminProductResearchSectionShell>
  );
}

export function AdminProductResearchAlibabaLinksPageClient() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [linksText, setLinksText] = useState("");
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<ProductResearchImportPreview | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState<"preview" | "commit" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);

  const links = useMemo(() => linksText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean), [linksText]);

  async function runPreview() {
    setBusy("preview");
    setError(null);
    setMessage(null);
    try {
      const result = await previewProductResearchAlibabaImport({ links, notes });
      setPreview(result);
      setSelected((result.previewItems ?? []).map((_, index) => index));
      requestAnimationFrame(() => {
        previewPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "Alibaba 链接预览失败" : "Failed to preview Alibaba links");
    } finally {
      setBusy(null);
    }
  }

  async function runCommit() {
    if (!preview?.previewItems?.length || selected.length === 0) return;
    if (!window.confirm(zh ? `确认导入 ${selected.length} 个 Alibaba 候选品吗？` : `Import ${selected.length} Alibaba link candidates?`)) return;
    setBusy("commit");
    setError(null);
    setMessage(null);
    try {
      const result = await commitProductResearchAlibabaImport({
        previewItems: preview.previewItems as Array<Record<string, unknown>>,
        selectedIndexes: selected,
        notes,
      });
      setMessage(zh ? `已导入 ${result.importedCount} 个链接候选品。重复 ${result.duplicateCount}，跳过 ${result.skippedCount}。` : `Imported ${result.importedCount} link candidates. Duplicates: ${result.duplicateCount}. Skipped: ${result.skippedCount}.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : zh ? "Alibaba 链接导入失败" : "Failed to commit Alibaba links");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminProductResearchSectionShell eyebrow={zh ? "研究" : "Research"} title={zh ? "Alibaba 链接导入" : "Alibaba Links Import"} body={zh ? "粘贴供应商链接，预览 AI 补全后的候选品草稿，只导入通过重复项和风险审核的行。" : "Paste supplier links, preview AI-enriched candidate drafts, and import only the rows that survive duplicate and risk review."}>
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl bg-white p-6">
          <Field label={zh ? "Alibaba 链接" : "Alibaba links"}>
            <textarea value={linksText} onChange={(event) => setLinksText(event.target.value)} className="min-h-48 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" placeholder={zh ? "每行一个链接" : "One link per line"} />
          </Field>
          <Field label={zh ? "备注" : "Notes"}>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-24 w-full rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" placeholder={zh ? "供应商背景、价格提示、图片版权备注" : "Supplier context, price hints, image-rights notes"} />
          </Field>
          <div className="mt-5 flex gap-3">
            <Button className="flex-1" variant="outline" disabled={busy !== null || links.length === 0} onClick={() => void runPreview()}>
              {busy === "preview" ? (zh ? "预览中..." : "Previewing...") : (zh ? "预览" : "Preview")}
            </Button>
            <Button className="flex-1" variant="lime" disabled={busy !== null || !preview?.previewItems?.length || selected.length === 0} onClick={() => void runCommit()}>
              {busy === "commit" ? (zh ? "导入中..." : "Importing...") : (zh ? "导入所选" : "Import Selected")}
            </Button>
          </div>
        </div>
        <div ref={previewPanelRef}>
        <ImportPreviewPanel
          preview={preview}
          selected={selected}
          onToggle={setSelected}
          onCommit={() => void runCommit()}
          commitLabel={busy === "commit" ? (zh ? "导入中..." : "Importing...") : (zh ? "导入所选" : "Import Selected")}
          busy={busy === "commit"}
          error={error}
          message={message}
          emptyMessage={zh ? "还没有 Alibaba 预览。" : "No Alibaba preview yet."}
          itemSource="previewItems"
        />
        </div>
      </section>
    </AdminProductResearchSectionShell>
  );
}

function ImportPreviewPanel({
  preview,
  selected,
  onToggle,
  onCommit,
  commitLabel,
  busy,
  error,
  message,
  emptyMessage,
  itemSource,
}: {
  preview: ProductResearchImportPreview | null;
  selected: number[];
  onToggle: (indexes: number[]) => void;
  onCommit: () => void;
  commitLabel: string;
  busy: boolean;
  error: string | null;
  message: string | null;
  emptyMessage: string;
  itemSource: "items" | "previewItems";
}) {
  const items = itemSource === "items" ? preview?.items ?? [] : preview?.previewItems ?? [];

  return (
    <div className="rounded-3xl bg-white p-6">
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-lime-200 bg-lime/10 px-4 py-3 text-sm text-graphite">{message}</div> : null}
      {items.length === 0 ? <p className="text-sm text-muted">{emptyMessage}</p> : null}
      {items.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-graphite">{items.length} preview rows</p>
            <Button variant="lime" disabled={busy || selected.length === 0} onClick={onCommit}>
              {commitLabel}
            </Button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <label key={`${item.productName}-${index}`} className="block rounded-2xl border border-graphite/10 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(index)}
                    onChange={(event) => {
                      onToggle(event.target.checked ? [...new Set([...selected, index])] : selected.filter((value) => value !== index));
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-graphite">{item.productName}</p>
                      <span className="rounded-full bg-warm px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">{item.category}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{item.positioningSummary ?? item.description ?? "No summary"}</p>
                    {item.duplicateHints && item.duplicateHints.length > 0 ? <p className="mt-2 text-xs font-semibold text-amber-700">Possible duplicates: {item.duplicateHints.join(", ")}</p> : null}
                    {item.riskWarnings && item.riskWarnings.length > 0 ? <p className="mt-2 text-xs font-semibold text-red-700">{item.riskWarnings.join(" | ")}</p> : null}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CsvPreviewPanel({ preview, error, message }: { preview: ProductResearchImportPreview | null; error: string | null; message: string | null }) {
  return (
    <div className="rounded-3xl bg-white p-6">
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-lime-200 bg-lime/10 px-4 py-3 text-sm text-graphite">{message}</div> : null}
      {!preview ? <p className="text-sm text-muted">No preview yet.</p> : null}
      {preview ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <StatCard label="Preview Rows" value={String(preview.previewRows?.length ?? 0)} />
            <StatCard label="Duplicates" value={String(preview.duplicates.length)} />
            <StatCard label="Invalid" value={String(preview.invalidRows.length)} />
          </div>
          {(preview.previewRows?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {(preview.previewRows ?? []).slice(0, 8).map((row, index) => (
                <div key={`${row.productName}-${index}`} className="rounded-2xl border border-graphite/10 p-4">
                  <p className="font-semibold text-graphite">{row.productName}</p>
                  <p className="mt-1 text-sm text-muted">{row.category} · {row.targetMarket}</p>
                </div>
              ))}
            </div>
          ) : null}
          {preview.invalidRows.length > 0 ? (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {preview.invalidRows.slice(0, 5).map((row) => (
                <p key={row.index}>Row {row.index + 1}: {row.errors.join(", ")}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-warm px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-semibold text-graphite">{value}</p>
    </div>
  );
}

function parseCsv(input: string) {
  const lines = input.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      if (inQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
