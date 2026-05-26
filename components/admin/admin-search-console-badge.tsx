"use client";

import { useLocale } from "@/components/locale-provider";
import type { SearchConsoleConnection } from "@/lib/admin-seo-types";

export function AdminSearchConsoleBadge({ connection }: { connection: SearchConsoleConnection }) {
  const { locale } = useLocale();
  const zh = locale === "zh";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        connection.connected ? "bg-lime/20 text-graphite" : "bg-amber-100 text-amber-800"
      }`}
    >
      {zh ? "Search Console" : "Search Console"} {connection.status === "Connected" ? (zh ? "已连接" : "Connected") : (zh ? "未连接" : "Not Connected")}
    </span>
  );
}
