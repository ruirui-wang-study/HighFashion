"use client";

import { useState } from "react";
import { addAdminOrderNote, fulfillAdminOrder } from "@/lib/admin-api";
import type { AdminOrderDetail } from "@/lib/admin-orders-types";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";
import { AdminPageHeader } from "./admin-page-header";
import { AdminFulfillmentStatusBadge, AdminPaymentStatusBadge } from "./admin-order-status-badge";
import { useLocale } from "@/components/locale-provider";

export function AdminOrderDetailPageClient({ initialOrder }: { initialOrder: AdminOrderDetail }) {
  const { messages, locale } = useLocale();
  const orderMessages = messages.admin.orderDetail;
  const common = messages.admin.common;
  const [order, setOrder] = useState(initialOrder);
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState<"note" | "fulfill" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveNote() {
    const trimmed = note.trim();
    if (!trimmed) return;
    setPendingAction("note");
    setError(null);
    try {
      const created = await addAdminOrderNote(order.id, { note: trimmed });
      setOrder((current) => ({ ...current, notes: [created, ...current.notes] }));
      setNote("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : orderMessages.loadFailed);
    } finally {
      setPendingAction(null);
    }
  }

  async function fulfill() {
    setPendingAction("fulfill");
    setError(null);
    try {
      const updated = await fulfillAdminOrder(order.id);
      setOrder(updated);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : orderMessages.loadFailed);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={orderMessages.eyebrow}
        title={order.orderNo}
        body={orderMessages.body}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{orderMessages.cards.payment}</p><div className="mt-3"><AdminPaymentStatusBadge status={order.paymentStatus} /></div></div>
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{orderMessages.cards.fulfillment}</p><div className="mt-3"><AdminFulfillmentStatusBadge status={order.fulfillmentStatus} /></div></div>
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{orderMessages.cards.total}</p><p className="mt-3 font-display text-3xl font-black">{formatCents(order.totalCents, order.currency.toUpperCase())}</p></div>
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{orderMessages.cards.placed}</p><p className="mt-3 font-bold text-graphite">{order.createdAt ? new Date(order.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US") : common.unknown}</p></div>
      </section>

      {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{orderMessages.sections.detail}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Detail label={orderMessages.fields.email} value={order.email ?? common.noEmail} />
              <Detail label={orderMessages.fields.country} value={order.customerCountry ?? common.noCountry} />
              <Detail label={orderMessages.fields.checkoutSession} value={order.stripeCheckoutSessionId ?? common.notAvailable} />
              <Detail label={orderMessages.fields.paymentIntent} value={order.stripePaymentIntentId ?? common.notAvailable} />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{orderMessages.sections.items}</p>
            <div className="mt-5 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 rounded-2xl bg-warm p-4">
                  <div>
                    <p className="font-bold text-graphite">{item.titleSnapshot}</p>
                    <p className="mt-1 text-sm text-muted">{item.colorSnapshot} / {item.sizeSnapshot}</p>
                    <p className="mt-1 text-xs text-muted">{common.quantityShort} {item.quantity} / {item.skuSnapshot}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-graphite">{formatCents(item.lineTotalCents, order.currency.toUpperCase())}</p>
                    <p className="mt-1 text-xs text-muted">{formatCents(item.unitPriceCents, order.currency.toUpperCase())} {common.each}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{orderMessages.sections.notes}</p>
            <div className="mt-5 grid gap-3">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
                placeholder={orderMessages.notePlaceholder}
              />
              <div>
                <Button onClick={saveNote} disabled={pendingAction !== null}>{pendingAction === "note" ? orderMessages.savingNote : orderMessages.addNote}</Button>
              </div>
              <div className="space-y-3">
                {order.notes.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-warm p-4">
                    <p className="text-sm leading-6 text-graphite">{item.note}</p>
                    <p className="mt-2 text-xs text-muted">{item.createdByAdmin?.name ?? common.system} / {new Date(item.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}</p>
                  </div>
                ))}
                {!order.notes.length ? <p className="text-sm text-muted">{orderMessages.noNotes}</p> : null}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{orderMessages.sections.shipping}</p>
            <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-warm p-4 text-sm leading-6 text-graphite">{formatShipping(order, orderMessages.noShippingAddress)}</pre>
          </section>

          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{orderMessages.sections.fulfillment}</p>
            <p className="mt-4 text-sm text-muted">{orderMessages.fulfillmentBody}</p>
            <div className="mt-5">
              <Button onClick={fulfill} disabled={pendingAction !== null || order.fulfillmentStatus === "FULFILLED"}>
                {pendingAction === "fulfill" ? orderMessages.markingFulfilled : order.fulfillmentStatus === "FULFILLED" ? orderMessages.alreadyFulfilled : orderMessages.markFulfilled}
              </Button>
            </div>
            {order.fulfilledAt ? <p className="mt-3 text-xs text-muted">{orderMessages.fulfilledAt} {new Date(order.fulfilledAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}</p> : null}
          </section>

          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{orderMessages.sections.timeline}</p>
            <div className="mt-5 space-y-3">
              {order.statusEvents.map((event) => (
                <div key={event.id} className="rounded-2xl bg-warm p-4">
                  <p className="font-bold text-graphite">{event.type}</p>
                  <p className="mt-1 text-sm text-muted">{event.fromValue ?? common.notApplicable} {common.to} {event.toValue ?? common.notApplicable}</p>
                  <p className="mt-2 text-xs text-muted">{new Date(event.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")} / {event.createdByAdmin?.name ?? common.system}</p>
                </div>
              ))}
              {!order.statusEvents.length ? <p className="text-sm text-muted">{orderMessages.noStatusEvents}</p> : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 font-bold text-graphite">{value}</p>
    </div>
  );
}

function formatShipping(order: AdminOrderDetail, fallback: string) {
  const address = order.shippingAddress?.address;
  return [
    order.shippingAddress?.name,
    address?.line1,
    address?.line2,
    [address?.city, address?.state, address?.postal_code].filter(Boolean).join(", "),
    address?.country,
  ].filter(Boolean).join("\n") || fallback;
}
