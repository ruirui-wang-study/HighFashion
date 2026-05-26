"use client";

import { useLocale } from "@/components/locale-provider";
import type { AdminMerchantConnection } from "@/lib/admin-marketing-types";

export function AdminMerchantConnectionBadge({ connection }: { connection: AdminMerchantConnection }) {
  const { locale } = useLocale();
  const zh = locale === "zh";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        connection.connected ? "bg-lime/20 text-graphite" : "bg-amber-100 text-amber-800"
      }`}
    >
      {zh ? "Merchant 中心" : "Merchant"} {connection.status === "Connected" ? (zh ? "已连接" : "Connected") : (zh ? "未连接" : "Not Connected")}
    </span>
  );
}
