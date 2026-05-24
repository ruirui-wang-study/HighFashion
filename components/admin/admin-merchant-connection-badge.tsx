import type { AdminMerchantConnection } from "@/lib/admin-marketing-types";

export function AdminMerchantConnectionBadge({ connection }: { connection: AdminMerchantConnection }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        connection.connected ? "bg-lime/20 text-graphite" : "bg-amber-100 text-amber-800"
      }`}
    >
      Merchant {connection.status}
    </span>
  );
}
