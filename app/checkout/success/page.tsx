"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { getOrderBySession } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { formatCents } from "@/lib/utils";

export default function CheckoutSuccessPage() {
  return <Suspense fallback={<Section><Container className="max-w-4xl"><div className="rounded-[1.5rem] bg-white p-6 font-bold">Loading checkout...</div></Container></Section>}><CheckoutSuccessContent /></Suspense>;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    const load = async () => {
      try {
        const result = await getOrderBySession(sessionId);
        if (!active) return;
        setOrder(result);
        setError(null);
        if (result.status === "PENDING" && attempts < 6) {
          setTimeout(() => setAttempts((value) => value + 1), 2500);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load order");
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [sessionId, attempts]);

  return (
    <Section>
      <Container className="max-w-4xl">
        <SectionHeader eyebrow="Checkout" title="Order status" body="Stripe confirms payment through a webhook. If the status is still pending, this page will check a few times." />
        {!sessionId ? <div className="rounded-[1.5rem] bg-white p-6 font-bold">Missing checkout session.</div> : null}
        {error ? <div className="rounded-[1.5rem] bg-white p-6 font-bold text-red-600">{error}</div> : null}
        {!order && !error ? <div className="rounded-[1.5rem] bg-white p-6 font-bold">Loading order...</div> : null}
        {order ? (
          <div className="rounded-[1.5rem] bg-white p-6">
            <div className="flex flex-col gap-3 border-b border-graphite/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-muted">Order number</p><h1 className="font-display text-4xl font-black uppercase tracking-[-0.05em]">{order.orderNo}</h1></div>
              <span className="rounded-full bg-lime px-4 py-2 text-xs font-black uppercase tracking-[0.14em]">{order.status === "PENDING" ? "Processing payment" : order.status}</span>
            </div>
            <div className="mt-5 space-y-3">
              {order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 rounded-2xl bg-warm p-4"><div><p className="font-bold">{item.titleSnapshot}</p><p className="text-sm text-muted">{item.colorSnapshot} / {item.sizeSnapshot} x {item.quantity}</p></div><p className="font-bold">{formatCents(item.lineTotalCents, order.currency.toUpperCase())}</p></div>)}
            </div>
            <div className="mt-6 space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCents(order.subtotalCents, order.currency.toUpperCase())}</span></div><div className="flex justify-between"><span>Shipping</span><span>{formatCents(order.shippingCents, order.currency.toUpperCase())}</span></div><div className="flex justify-between text-lg font-black"><span>Total</span><span>{formatCents(order.totalCents, order.currency.toUpperCase())}</span></div></div>
            <Button asChild className="mt-8" variant="lime"><Link href="/shop">Continue shopping</Link></Button>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

