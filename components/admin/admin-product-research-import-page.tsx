"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { AdminProductResearchSectionShell } from "./admin-product-research-section-shell";

export function AdminProductResearchImportPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const items = [
    {
      href: "/admin/product-research/import/ai",
      title: zh ? "AI 生成候选品" : "AI Generate Candidates",
      body: zh ? "根据品牌方向、排除项和目标市场生成研究候选品。" : "Generate research candidates from brand direction, exclusions, and market focus.",
    },
    {
      href: "/admin/product-research/import/csv",
      title: zh ? "候选品 CSV 导入" : "Candidate CSV Import",
      body: zh ? "上传映射后的 CSV，预览重复项，并控制合并或跳过。" : "Upload a mapped CSV, preview duplicates, and control merge or skip decisions.",
    },
    {
      href: "/admin/product-research/import/alibaba-links",
      title: zh ? "Alibaba 链接" : "Alibaba Links",
      body: zh ? "粘贴链接做手工补充、风险标记和供应商关联。" : "Paste links for manual enrichment, risk tagging, and supplier association.",
    },
    {
      href: "/admin/product-research/import/batches",
      title: zh ? "导入批次" : "Import Batches",
      body: zh ? "查看导入历史、行数、重复项和无效行。" : "Inspect import history, row counts, duplicates, and invalid rows.",
    },
  ];

  return (
    <AdminProductResearchSectionShell
      eyebrow={zh ? "研究" : "Research"}
      title={zh ? "导入" : "Imports"}
      body={
        zh
          ? "候选品导入会先经过预览、重复项审核和人工确认，再进入研究管道。"
          : "Candidate intake is intentionally gated behind preview, duplicate review, and manual confirmation before anything lands in the research pipeline."
      }
    >
      <section className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-3xl bg-white p-6 transition hover:bg-warm">
            <p className="font-bold text-graphite">{item.title}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
          </Link>
        ))}
      </section>
    </AdminProductResearchSectionShell>
  );
}
