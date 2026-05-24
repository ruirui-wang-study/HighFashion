"use client";

import { useState } from "react";
import { addAdminOrderNote, fulfillAdminOrder } from "@/lib/admin-api";
import type { AdminOrderDetail } from "@/lib/admin-orders-types";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";
import { AdminPageHeader } from "./admin-page-header";
import { AdminFulfillmentStatusBadge, AdminPaymentStatusBadge } from "./admin-order-status-badge";

export function AdminOrderDetailPageClient({ initialOrder }: { initialOrder: AdminOrderDetail }) {
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
      setError(nextError instanceof Error ? nextError.message : "Failed to save note");
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
      setError(nextError instanceof Error ? nextError.message : "Failed to fulfill order");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title={order.orderNo}
        body="Review order detail, Stripe IDs, shipping address, notes, and fulfillment activity."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Payment</p><div className="mt-3"><AdminPaymentStatusBadge status={order.paymentStatus} /></div></div>
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Fulfillment</p><div className="mt-3"><AdminFulfillmentStatusBadge status={order.fulfillmentStatus} /></div></div>
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Total</p><p className="mt-3 font-display text-3xl font-black">{formatCents(order.totalCents, order.currency.toUpperCase())}</p></div>
        <div className="rounded-3xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Placed</p><p className="mt-3 font-bold text-graphite">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-US") : "Unknown"}</p></div>
      </section>

      {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Order detail</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Detail label="Email" value={order.email ?? "No email"} />
              <Detail label="Country" value={order.customerCountry ?? "No country"} />
              <Detail label="Checkout Session" value={order.stripeCheckoutSessionId ?? "Not available"} />
              <Detail label="PaymentIntent" value={order.stripePaymentIntentId ?? "Not available"} />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Items</p>
            <div className="mt-5 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 rounded-2xl bg-warm p-4">
                  <div>
                    <p className="font-bold text-graphite">{item.titleSnapshot}</p>
                    <p className="mt-1 text-sm text-muted">{item.colorSnapshot} / {item.sizeSnapshot}</p>
                    <p className="mt-1 text-xs text-muted">Qty {item.quantity} / {item.skuSnapshot}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-graphite">{formatCents(item.lineTotalCents, order.currency.toUpperCase())}</p>
                    <p className="mt-1 text-xs text-muted">{formatCents(item.unitPriceCents, order.currency.toUpperCase())} each</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Internal notes</p>
            <div className="mt-5 grid gap-3">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-28 rounded-2xl border border-graphite/10 px-4 py-3 text-sm outline-none"
                placeholder="Add an internal note for operations or support."
              />
              <div>
                <Button onClick={saveNote} disabled={pendingAction !== null}>{pendingAction === "note" ? "Saving note" : "Add note"}</Button>
              </div>
              <div className="space-y-3">
                {order.notes.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-warm p-4">
                    <p className="text-sm leading-6 text-graphite">{item.note}</p>
                    <p className="mt-2 text-xs text-muted">{item.createdByAdmin?.name ?? "System"} / {new Date(item.createdAt).toLocaleString("en-US")}</p>
                  </div>
                ))}
                {!order.notes.length ? <p className="text-sm text-muted">No notes yet.</p> : null}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Shipping address</p>
            <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-warm p-4 text-sm leading-6 text-graphite">{formatShipping(order)}</pre>
          </section>

          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Fulfillment</p>
            <p className="mt-4 text-sm text-muted">Mark the order fulfilled when operations complete packing and handoff. Future work will extend this to carrier and tracking integration.</p>
            <div className="mt-5">
              <Button onClick={fulfill} disabled={pendingAction !== null || order.fulfillmentStatus === "FULFILLED"}>
                {pendingAction === "fulfill" ? "Marking fulfilled" : order.fulfillmentStatus === "FULFILLED" ? "Already fulfilled" : "Mark fulfilled"}
              </Button>
            </div>
            {order.fulfilledAt ? <p className="mt-3 text-xs text-muted">Fulfilled at {new Date(order.fulfilledAt).toLocaleString("en-US")}</p> : null}
          </section>

          <section className="rounded-3xl bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">Status timeline</p>
            <div className="mt-5 space-y-3">
              {order.statusEvents.map((event) => (
                <div key={event.id} className="rounded-2xl bg-warm p-4">
                  <p className="font-bold text-graphite">{event.type}</p>
                  <p className="mt-1 text-sm text-muted">{event.fromValue ?? "N/A"} to {event.toValue ?? "N/A"}</p>
                  <p className="mt-2 text-xs text-muted">{new Date(event.createdAt).toLocaleString("en-US")} / {event.createdByAdmin?.name ?? "System"}</p>
                </div>
              ))}
              {!order.statusEvents.length ? <p className="text-sm text-muted">No status events yet.</p> : null}
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

function formatShipping(order: AdminOrderDetail) {
  const address = order.shippingAddress?.address;
  return [
    order.shippingAddress?.name,
    address?.line1,
    address?.line2,
    [address?.city, address?.state, address?.postal_code].filter(Boolean).join(", "),
    address?.country,
  ].filter(Boolean).join("\n") || "No shipping address";
}
