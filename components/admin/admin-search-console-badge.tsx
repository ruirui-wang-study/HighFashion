import type { SearchConsoleConnection } from "@/lib/admin-seo-types";

export function AdminSearchConsoleBadge({ connection }: { connection: SearchConsoleConnection }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        connection.connected ? "bg-lime/20 text-graphite" : "bg-amber-100 text-amber-800"
      }`}
    >
      Search Console {connection.status}
    </span>
  );
}
