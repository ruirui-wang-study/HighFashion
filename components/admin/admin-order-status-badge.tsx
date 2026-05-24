import type { AdminFulfillmentStatus, AdminPaymentStatus } from "@/lib/admin-orders-types";

export function AdminPaymentStatusBadge({ status }: { status: AdminPaymentStatus }) {
  const tone =
    status === "PAID" ? "bg-lime/20 text-graphite"
      : status === "FAILED" || status === "REFUNDED" ? "bg-red-100 text-red-700"
        : "bg-warm text-graphite";

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${tone}`}>{status}</span>;
}

export function AdminFulfillmentStatusBadge({ status }: { status: AdminFulfillmentStatus }) {
  const tone = status === "FULFILLED" ? "bg-lime/20 text-graphite" : "bg-amber-100 text-amber-800";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${tone}`}>{status}</span>;
}
