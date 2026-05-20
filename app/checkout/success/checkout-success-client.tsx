"use client";

import { CheckCircle2, Clock3, CreditCard, MapPin, PackageCheck, ReceiptText, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Badge } from "@/components/ui/badge";
import type { Order, OrderAddress } from "@/lib/types";
import { getOrderBySession } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { formatCents } from "@/lib/utils";

const pollIntervalMs = 2500;
const maxPollAttempts = 6;
const successStatuses = new Set<Order["status"]>(["PAID", "FULFILLED"]);
const failureStatuses = new Set<Order["status"]>(["PAYMENT_FAILED", "EXPIRED", "CANCELED", "REFUNDED"]);

export function CheckoutSuccessPageClient() {
  return <Suspense fallback={<Section><Container className="max-w-4xl"><div className="rounded-[1.5rem] bg-white p-6 font-bold">Loading checkout...</div></Container></Section>}><CheckoutSuccessContent /></Suspense>;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const clearedCartRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    let timeoutId: number | undefined;

    const load = async () => {
      try {
        const result = await getOrderBySession(sessionId);
        if (!active) return;
        setOrder(result);
        setError(null);
        if (result.status === "PENDING" && attempts < maxPollAttempts) {
          timeoutId = window.setTimeout(() => setAttempts((value) => value + 1), pollIntervalMs);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load order");
      }
    };
    void load();
    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [sessionId, attempts]);

  useEffect(() => {
    if (!order || clearedCartRef.current || !successStatuses.has(order.status)) return;
    clearCart();
    clearedCartRef.current = true;
  }, [clearCart, order]);

  const status = order?.status;
  const isPending = status === "PENDING";
  const isSuccessful = status ? successStatuses.has(status) : false;
  const isFailure = status ? failureStatuses.has(status) : false;
  const currency = order?.currency?.toUpperCase() ?? "USD";

  return (
    <Section>
      <Container className="max-w-4xl">
        <SectionHeader eyebrow="Checkout" title="Order status" body="Stripe confirms payment through a webhook. If confirmation lags for a few seconds, this page keeps checking before asking you to do anything." />
        {!sessionId ? (
          <div className="rounded-[1.5rem] bg-white p-6">
            <p className="font-bold">Missing checkout session.</p>
            <p className="mt-2 text-sm text-muted">Open checkout again from your cart to create a Stripe session.</p>
            <Button asChild className="mt-5" variant="outline"><Link href="/cart">Return to cart</Link></Button>
          </div>
        ) : null}
        {error ? (
          <div className="rounded-[1.5rem] bg-white p-6">
            <p className="font-bold text-red-600">{error}</p>
            <Button asChild className="mt-5" variant="outline"><Link href="/cart">Return to cart</Link></Button>
          </div>
        ) : null}
        {!order && !error && sessionId ? <div className="rounded-[1.5rem] bg-white p-6 font-bold">Loading order...</div> : null}
        {order ? (
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-[1.5rem] bg-white p-6">
                <div className="flex flex-col gap-4 border-b border-graphite/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted">Order number</p>
                    <h1 className="font-display text-4xl font-black uppercase tracking-[-0.05em]">{order.orderNo}</h1>
                    <p className="mt-3 text-sm text-muted">{getStatusBody(order.status)}</p>
                  </div>
                  <Badge className={getStatusBadgeClassName(order.status)}>{getStatusLabel(order.status)}</Badge>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoTile icon={ReceiptText} label="Payment status" value={getStatusLabel(order.status)} />
                  <InfoTile icon={CreditCard} label="Payment method" value={formatPaymentMethod(order.paymentMethodType)} />
                </div>
                {isPending ? (
                  <div className="mt-5 rounded-3xl border border-graphite/10 bg-warm p-4">
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-5 w-5 text-signal" />
                      <div>
                        <p className="font-bold">Processing payment</p>
                        <p className="mt-1 text-sm text-muted">
                          Stripe redirect completed, and this page is waiting for the webhook confirmation. {attempts < maxPollAttempts ? "Checking again shortly." : "Refresh if payment has already completed in Stripe."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                {isSuccessful ? (
                  <div className="mt-5 rounded-3xl border border-lime/40 bg-lime/10 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-graphite" />
                      <div>
                        <p className="font-bold">Payment successful</p>
                        <p className="mt-1 text-sm text-muted">Your order is confirmed. The cart has been cleared for the next session.</p>
                      </div>
                    </div>
                  </div>
                ) : null}
                {isFailure ? (
                  <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <TriangleAlert className="mt-0.5 h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-bold text-red-700">{getStatusLabel(order.status)}</p>
                        <p className="mt-1 text-sm text-red-700/80">No cart items were cleared. Review your kit and start checkout again when ready.</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.5rem] bg-white p-6">
                <div className="flex items-center gap-3 border-b border-graphite/10 pb-4">
                  <PackageCheck className="h-5 w-5" />
                  <h2 className="font-bold uppercase tracking-[0.14em]">Items</h2>
                </div>
                <div className="mt-5 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 rounded-2xl bg-warm p-4">
                      <div>
                        <p className="font-bold">{item.titleSnapshot}</p>
                        <p className="text-sm text-muted">{item.colorSnapshot} / {item.sizeSnapshot}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">Qty {item.quantity} · {item.skuSnapshot}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCents(item.lineTotalCents, currency)}</p>
                        <p className="text-sm text-muted">{formatCents(item.unitPriceCents, currency)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <aside className="space-y-6">
              <div className="rounded-[1.5rem] bg-white p-6">
                <div className="flex items-center gap-3 border-b border-graphite/10 pb-4">
                  <MapPin className="h-5 w-5" />
                  <h2 className="font-bold uppercase tracking-[0.14em]">Contact & shipping</h2>
                </div>
                <dl className="mt-5 space-y-5 text-sm">
                  <DetailRow label="Email" value={order.email ?? order.billingAddress?.email ?? "Not provided"} />
                  <DetailRow label="Country" value={order.customerCountry ?? order.shippingAddress?.address?.country ?? order.billingAddress?.address?.country ?? "Pending"} />
                  <DetailRow label="Shipping" value={formatShipping(order)} />
                  <DetailRow label="Billing" value={formatBilling(order)} />
                </dl>
              </div>

              <div className="rounded-[1.5rem] bg-white p-6">
                <div className="flex items-center gap-3 border-b border-graphite/10 pb-4">
                  <ReceiptText className="h-5 w-5" />
                  <h2 className="font-bold uppercase tracking-[0.14em]">Amount</h2>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCents(order.subtotalCents, currency)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{formatCents(order.shippingCents, currency)}</span></div>
                  {order.discountCents > 0 ? <div className="flex justify-between"><span>Discount</span><span>-{formatCents(order.discountCents, currency)}</span></div> : null}
                  <div className="flex justify-between border-t border-graphite/10 pt-3 text-lg font-black"><span>Total</span><span>{formatCents(order.totalCents, currency)}</span></div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  {isFailure ? <Button asChild variant="outline"><Link href="/cart">Return to cart</Link></Button> : null}
                  <Button asChild variant={isSuccessful ? "lime" : "outline"}><Link href={isFailure ? "/cart" : "/shop"}>{isFailure ? "Retry checkout" : "Continue shopping"}</Link></Button>
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof CreditCard; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-warm p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="mt-3 font-bold">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1 whitespace-pre-line font-bold text-graphite">{value}</dd>
    </div>
  );
}

function getStatusLabel(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return "Processing payment";
    case "PAID":
      return "Payment successful";
    case "PAYMENT_FAILED":
      return "Payment failed";
    case "EXPIRED":
      return "Checkout expired";
    case "FULFILLED":
      return "Order fulfilled";
    case "CANCELED":
      return "Order canceled";
    case "REFUNDED":
      return "Refunded";
    default:
      return status;
  }
}

function getStatusBody(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return "Stripe redirected you back. The order exists and the page is waiting for webhook confirmation.";
    case "PAID":
      return "Payment is confirmed and the order is ready for fulfillment.";
    case "PAYMENT_FAILED":
      return "Stripe did not confirm payment for this checkout session.";
    case "EXPIRED":
      return "This checkout session expired before payment was completed.";
    case "FULFILLED":
      return "The order has already been confirmed and fulfilled.";
    case "CANCELED":
      return "This order was canceled after checkout.";
    case "REFUNDED":
      return "Payment was completed earlier and has since been refunded.";
    default:
      return status;
  }
}

function getStatusBadgeClassName(status: Order["status"]) {
  if (successStatuses.has(status)) return "bg-lime text-graphite";
  if (failureStatuses.has(status)) return "border-red-200 bg-red-50 text-red-700";
  return "border-graphite/10 bg-warm text-graphite";
}

function formatPaymentMethod(paymentMethodType: string | null | undefined) {
  if (!paymentMethodType) return "Pending";
  return paymentMethodType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatShipping(order: Order) {
  if (!order.shippingAddress) {
    return order.status === "PENDING" ? "Waiting for webhook confirmation" : "Not available";
  }
  return [order.shippingAddress.name, formatAddress(order.shippingAddress.address)].filter(Boolean).join("\n");
}

function formatBilling(order: Order) {
  if (!order.billingAddress) {
    return order.status === "PENDING" ? "Waiting for webhook confirmation" : "Not available";
  }
  return [order.billingAddress.name, order.billingAddress.email, order.billingAddress.phone, formatAddress(order.billingAddress.address)].filter(Boolean).join("\n");
}

function formatAddress(address: OrderAddress | null | undefined) {
  if (!address) return "";
  const cityLine = [address.city, address.state, address.postal_code].filter(Boolean).join(", ");
  return [address.line1, address.line2, cityLine, address.country].filter(Boolean).join("\n");
}
