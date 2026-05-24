import type { AdminAnalyticsConnection } from "@/lib/admin-analytics-types";

export function AdminConnectionBadge({ ga4 }: { ga4: AdminAnalyticsConnection }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        ga4.connected ? "bg-lime/20 text-graphite" : "bg-amber-100 text-amber-800"
      }`}
    >
      GA4 {ga4.status}
    </span>
  );
}
