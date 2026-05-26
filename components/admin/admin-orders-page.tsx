"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminOrders } from "@/lib/admin-api";
import type { AdminOrderListItem } from "@/lib/admin-orders-types";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";
import { AdminPageHeader } from "./admin-page-header";
import { AdminFulfillmentStatusBadge, AdminPaymentStatusBadge } from "./admin-order-status-badge";

export function AdminOrdersPageClient() {
  const { messages } = useLocale();
  const copy = messages.admin.orders;
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminOrders({ search, paymentStatus, fulfillmentStatus, dateFrom, dateTo })
      .then((data) => {
        if (!active) return;
        setOrders(data);
        setError(null);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : copy.loadFailed);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, paymentStatus, fulfillmentStatus, dateFrom, dateTo, copy.loadFailed]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        body={copy.body}
      />

      <section className="rounded-3xl bg-white p-5">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            value={search}
            onChange={(event) => {
              setLoading(true);
              setSearch(event.target.value);
            }}
            placeholder={copy.searchPlaceholder}
            className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
          />
          <select value={paymentStatus} onChange={(event) => {
            setLoading(true);
            setPaymentStatus(event.target.value);
          }} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
            <option value="">{copy.filters.allPayments}</option>
            <option value="PENDING">{copy.filters.pending}</option>
            <option value="PAID">{copy.filters.paid}</option>
            <option value="FAILED">{copy.filters.failed}</option>
            <option value="REFUNDED">{copy.filters.refunded}</option>
          </select>
          <select value={fulfillmentStatus} onChange={(event) => {
            setLoading(true);
            setFulfillmentStatus(event.target.value);
          }} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none">
            <option value="">{copy.filters.allFulfillment}</option>
            <option value="UNFULFILLED">{copy.filters.unfulfilled}</option>
            <option value="FULFILLED">{copy.filters.fulfilled}</option>
          </select>
          <input type="date" value={dateFrom} onChange={(event) => {
            setLoading(true);
            setDateFrom(event.target.value);
          }} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
          <input type="date" value={dateTo} onChange={(event) => {
            setLoading(true);
            setDateTo(event.target.value);
          }} className="rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none" />
        </div>

        {error ? <p className="mt-4 text-sm font-bold text-red-700">{error}</p> : null}
        {loading ? <p className="mt-6 text-sm text-muted">{copy.loading}</p> : null}

        {!loading ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-graphite/10 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="px-3 py-3">{copy.table.order}</th>
                  <th className="px-3 py-3">{copy.table.payment}</th>
                  <th className="px-3 py-3">{copy.table.fulfillment}</th>
                  <th className="px-3 py-3">{copy.table.total}</th>
                  <th className="px-3 py-3">{copy.table.created}</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-graphite/5 align-top">
                    <td className="px-3 py-4">
                      <p className="font-bold text-graphite">{order.orderNo}</p>
                      <p className="mt-1 text-xs text-muted">{order.email ?? copy.noEmail}</p>
                      <p className="mt-1 text-xs text-muted">{order.customerCountry ?? copy.noCountry}</p>
                    </td>
                    <td className="px-3 py-4"><AdminPaymentStatusBadge status={order.paymentStatus} /></td>
                    <td className="px-3 py-4"><AdminFulfillmentStatusBadge status={order.fulfillmentStatus} /></td>
                    <td className="px-3 py-4 text-muted">{formatCents(order.totalCents, order.currency.toUpperCase())}</td>
                    <td className="px-3 py-4 text-muted">{new Date(order.createdAt).toLocaleString("en-US")}</td>
                    <td className="px-3 py-4 text-right">
                      <Button asChild variant="ghost"><Link href={`/admin/orders/${order.id}`}>{messages.admin.common.view}</Link></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!orders.length ? <p className="px-3 py-8 text-sm text-muted">{copy.noOrders}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
