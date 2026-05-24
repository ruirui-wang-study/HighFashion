"use client";

import { CheckCircle2, Clock3, CreditCard, MapPin, PackageCheck, ReceiptText, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useLocale } from "@/components/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { getOrderBySession } from "@/lib/api-client";
import type { Order, OrderAddress } from "@/lib/types";
import { formatCents } from "@/lib/utils";

const pollIntervalMs = 2500;
const maxPollAttempts = 6;
const successStatuses = new Set<Order["status"]>(["PAID", "FULFILLED"]);
const failureStatuses = new Set<Order["status"]>(["PAYMENT_FAILED", "EXPIRED", "CANCELED", "REFUNDED"]);

export function CheckoutSuccessPageClient(props: {
  supportEmail?: string | null;
  returnsPolicyUrl?: string | null;
  paymentFailureMessage?: string | null;
}) {
  return (
    <Suspense
      fallback={
        <Section>
          <Container className="max-w-4xl">
            <div className="rounded-[1.5rem] bg-white p-6 font-bold">Loading checkout...</div>
          </Container>
        </Section>
      }
    >
      <CheckoutSuccessContent {...props} />
    </Suspense>
  );
}

function CheckoutSuccessContent({
  supportEmail = "support@pulsegear.local",
  returnsPolicyUrl = "/faq",
  paymentFailureMessage = "Retry checkout from cart if payment is not confirmed.",
}: {
  supportEmail?: string | null;
  returnsPolicyUrl?: string | null;
  paymentFailureMessage?: string | null;
}) {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const copy = getCheckoutCopy(locale);
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
        setError(err instanceof Error ? err.message : copy.loadError);
      }
    };

    void load();
    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [attempts, copy.loadError, sessionId]);

  useEffect(() => {
    if (!order || clearedCartRef.current || !isOrderPaid(order)) return;
    clearCart();
    clearedCartRef.current = true;
  }, [clearCart, order]);

  const isPending = order ? isOrderPending(order) : false;
  const isSuccessful = order ? isOrderPaid(order) : false;
  const isFailure = order ? isOrderFailure(order) : false;
  const currency = order?.currency?.toUpperCase() ?? "USD";

  return (
    <Section>
      <Container className="max-w-4xl">
        <SectionHeader eyebrow={copy.sectionEyebrow} title={copy.sectionTitle} body={copy.sectionBody} />

        {!sessionId ? (
          <div className="rounded-[1.5rem] bg-white p-6">
            <p className="font-bold">{copy.missingSession}</p>
            <p className="mt-2 text-sm text-muted">{copy.missingSessionBody}</p>
            <Button asChild className="mt-5" variant="outline">
              <Link href="/cart">{copy.returnToCart}</Link>
            </Button>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[1.5rem] bg-white p-6">
            <p className="font-bold text-red-600">{error}</p>
            <Button asChild className="mt-5" variant="outline">
              <Link href="/cart">{copy.returnToCart}</Link>
            </Button>
          </div>
        ) : null}

        {!order && !error && sessionId ? <div className="rounded-[1.5rem] bg-white p-6 font-bold">{copy.loadingOrder}</div> : null}

        {order ? (
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-[1.5rem] bg-white p-6">
                <div className="flex flex-col gap-4 border-b border-graphite/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted">{copy.orderNumber}</p>
                    <h1 className="font-display text-4xl font-black uppercase tracking-[-0.05em]">{order.orderNo}</h1>
                    <p className="mt-3 text-sm text-muted">{getStatusBody(order, copy)}</p>
                  </div>
                  <Badge className={getStatusBadgeClassName(order)}>{getStatusLabel(order, copy)}</Badge>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoTile icon={ReceiptText} label={copy.paymentStatus} value={getStatusLabel(order, copy)} />
                  <InfoTile icon={CreditCard} label={copy.paymentMethod} value={formatPaymentMethod(order.paymentMethodType, copy)} />
                </div>

                {isPending ? (
                  <div className="mt-5 rounded-3xl border border-graphite/10 bg-warm p-4">
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-5 w-5 text-signal" />
                      <div>
                        <p className="font-bold">{copy.processingTitle}</p>
                        <p className="mt-1 text-sm text-muted">
                          {copy.processingBodyA} {attempts < maxPollAttempts ? copy.processingBodyB : copy.processingBodyC}
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
                        <p className="font-bold">{copy.successTitle}</p>
                        <p className="mt-1 text-sm text-muted">
                          {order.fulfillmentStatus === "FULFILLED" ? copy.successBodyFulfilled : copy.successBodyPaid}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {isFailure ? (
                  <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <TriangleAlert className="mt-0.5 h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-bold text-red-700">{getStatusLabel(order, copy)}</p>
                        <p className="mt-1 text-sm text-red-700/80">{paymentFailureMessage || copy.failureFallback}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.5rem] bg-white p-6">
                <div className="flex items-center gap-3 border-b border-graphite/10 pb-4">
                  <PackageCheck className="h-5 w-5" />
                  <h2 className="font-bold uppercase tracking-[0.14em]">{copy.items}</h2>
                </div>
                <div className="mt-5 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 rounded-2xl bg-warm p-4">
                      <div>
                        <p className="font-bold">{item.titleSnapshot}</p>
                        <p className="text-sm text-muted">{item.colorSnapshot} / {item.sizeSnapshot}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                          {copy.qty} {item.quantity} / {item.skuSnapshot}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCents(item.lineTotalCents, currency)}</p>
                        <p className="text-sm text-muted">
                          {formatCents(item.unitPriceCents, currency)} {copy.each}
                        </p>
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
                  <h2 className="font-bold uppercase tracking-[0.14em]">{copy.contactShipping}</h2>
                </div>
                <dl className="mt-5 space-y-5 text-sm">
                  <DetailRow label="Email" value={order.email ?? order.billingAddress?.email ?? copy.notProvided} />
                  <DetailRow label={copy.country} value={order.customerCountry ?? order.shippingAddress?.address?.country ?? order.billingAddress?.address?.country ?? copy.pending} />
                  <DetailRow label={copy.shipping} value={formatShipping(order, copy)} />
                  <DetailRow label={copy.billing} value={formatBilling(order, copy)} />
                </dl>
              </div>

              <div className="rounded-[1.5rem] bg-white p-6">
                <div className="flex items-center gap-3 border-b border-graphite/10 pb-4">
                  <ReceiptText className="h-5 w-5" />
                  <h2 className="font-bold uppercase tracking-[0.14em]">{copy.amount}</h2>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between"><span>{copy.subtotal}</span><span>{formatCents(order.subtotalCents, currency)}</span></div>
                  <div className="flex justify-between"><span>{copy.shippingFee}</span><span>{formatCents(order.shippingCents, currency)}</span></div>
                  {order.discountCents > 0 ? <div className="flex justify-between"><span>{copy.discount}</span><span>-{formatCents(order.discountCents, currency)}</span></div> : null}
                  <div className="flex justify-between border-t border-graphite/10 pt-3 text-lg font-black"><span>{copy.total}</span><span>{formatCents(order.totalCents, currency)}</span></div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  {isFailure ? <Button asChild variant="outline"><Link href="/cart">{copy.returnToCart}</Link></Button> : null}
                  <Button asChild variant={isSuccessful ? "lime" : "outline"}><Link href={isFailure ? "/cart" : "/shop"}>{isFailure ? copy.retryCheckout : copy.continueShopping}</Link></Button>
                </div>
                <div className="mt-6 rounded-2xl bg-warm p-4 text-sm leading-6 text-muted">
                  <p className="font-bold text-graphite">{copy.needHelp}</p>
                  <p className="mt-2">{copy.support} <a href={`mailto:${supportEmail}`} className="font-bold text-graphite">{supportEmail}</a></p>
                  <p className="mt-1">{copy.returnsPolicy} <Link href={returnsPolicyUrl || "/faq"} className="font-bold text-graphite">{copy.reviewPolicy}</Link>.</p>
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

function getStatusLabel(order: Order, copy: ReturnType<typeof getCheckoutCopy>) {
  if (order.paymentStatus === "PAID" && order.fulfillmentStatus === "FULFILLED") return copy.status.fulfilled;
  switch (order.status) {
    case "PENDING":
      return copy.status.processing;
    case "PAID":
      return copy.status.paid;
    case "PAYMENT_FAILED":
      return copy.status.failed;
    case "EXPIRED":
      return copy.status.expired;
    case "FULFILLED":
      return copy.status.fulfilled;
    case "CANCELED":
      return copy.status.canceled;
    case "REFUNDED":
      return copy.status.refunded;
    default:
      return order.status;
  }
}

function getStatusBody(order: Order, copy: ReturnType<typeof getCheckoutCopy>) {
  if (order.paymentStatus === "PAID" && order.fulfillmentStatus === "FULFILLED") return copy.body.fulfilled;
  if (order.paymentStatus === "PAID") return copy.body.paid;
  switch (order.status) {
    case "PENDING":
      return copy.body.pending;
    case "PAYMENT_FAILED":
      return copy.body.failed;
    case "EXPIRED":
      return copy.body.expired;
    case "FULFILLED":
      return copy.body.fulfilled;
    case "CANCELED":
      return copy.body.canceled;
    case "REFUNDED":
      return copy.body.refunded;
    default:
      return order.status;
  }
}

function getStatusBadgeClassName(order: Order) {
  if (isOrderPaid(order)) return "bg-lime text-graphite";
  if (isOrderFailure(order)) return "border-red-200 bg-red-50 text-red-700";
  return "border-graphite/10 bg-warm text-graphite";
}

function isOrderPending(order: Order) {
  return order.paymentStatus === "PENDING" || order.status === "PENDING";
}

function isOrderPaid(order: Order) {
  return order.paymentStatus === "PAID" || successStatuses.has(order.status);
}

function isOrderFailure(order: Order) {
  return order.paymentStatus === "FAILED" || order.paymentStatus === "REFUNDED" || failureStatuses.has(order.status);
}

function formatPaymentMethod(paymentMethodType: string | null | undefined, copy: ReturnType<typeof getCheckoutCopy>) {
  if (!paymentMethodType) return copy.pending;
  return paymentMethodType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatShipping(order: Order, copy: ReturnType<typeof getCheckoutCopy>) {
  if (!order.shippingAddress) return isOrderPending(order) ? copy.waitingWebhook : copy.notAvailable;
  return [order.shippingAddress.name, formatAddress(order.shippingAddress.address)].filter(Boolean).join("\n");
}

function formatBilling(order: Order, copy: ReturnType<typeof getCheckoutCopy>) {
  if (!order.billingAddress) return isOrderPending(order) ? copy.waitingWebhook : copy.notAvailable;
  return [order.billingAddress.name, order.billingAddress.email, order.billingAddress.phone, formatAddress(order.billingAddress.address)].filter(Boolean).join("\n");
}

function formatAddress(address: OrderAddress | null | undefined) {
  if (!address) return "";
  const cityLine = [address.city, address.state, address.postal_code].filter(Boolean).join(", ");
  return [address.line1, address.line2, cityLine, address.country].filter(Boolean).join("\n");
}

function getCheckoutCopy(locale: "en" | "zh") {
  return locale === "zh"
    ? {
        sectionEyebrow: "结账",
        sectionTitle: "订单状态",
        sectionBody: "Stripe 会通过 webhook 确认支付。如果确认稍有延迟，这个页面会自动继续轮询。",
        missingSession: "缺少结账会话。",
        missingSessionBody: "请重新从购物车进入结账，以创建 Stripe 会话。",
        returnToCart: "返回购物车",
        loadingOrder: "订单加载中...",
        loadError: "订单加载失败",
        orderNumber: "订单编号",
        paymentStatus: "支付状态",
        paymentMethod: "支付方式",
        processingTitle: "支付处理中",
        processingBodyA: "已从 Stripe 跳转回站点，当前正在等待 webhook 完成确认。",
        processingBodyB: "正在继续检查。",
        processingBodyC: "如果 Stripe 中支付已完成，请刷新当前页面。",
        successTitle: "支付成功",
        successBodyFulfilled: "订单已支付，并且后台已标记为完成履约。",
        successBodyPaid: "订单支付已确认，正在等待履约处理，购物车也已清空。",
        failureFallback: "当前订单未清空购物车，请检查后重新发起结账。",
        items: "商品明细",
        contactShipping: "联系与收货",
        country: "国家",
        shipping: "收货地址",
        billing: "账单地址",
        amount: "金额",
        subtotal: "小计",
        shippingFee: "运费",
        discount: "优惠",
        total: "总计",
        retryCheckout: "重新结账",
        continueShopping: "继续购物",
        needHelp: "需要帮助？",
        support: "支持邮箱：",
        returnsPolicy: "退货与政策：",
        reviewPolicy: "查看当前政策",
        notProvided: "未提供",
        pending: "待确认",
        each: "每件",
        qty: "数量",
        waitingWebhook: "等待 webhook 确认",
        notAvailable: "暂无",
        status: {
          processing: "支付处理中",
          paid: "支付成功",
          failed: "支付失败",
          expired: "结账会话已过期",
          fulfilled: "订单已履约",
          canceled: "订单已取消",
          refunded: "已退款",
        },
        body: {
          fulfilled: "支付已确认，且订单已经由后台完成履约。",
          paid: "支付已确认，订单正等待履约处理。",
          pending: "已从 Stripe 返回站点，当前订单正在等待 webhook 确认。",
          failed: "Stripe 尚未确认本次结账的支付。",
          expired: "这个结账会话在支付完成前已经过期。",
          canceled: "该订单在结账后被取消。",
          refunded: "该订单此前已支付成功，目前已退款。",
        },
      }
    : {
        sectionEyebrow: "Checkout",
        sectionTitle: "Order status",
        sectionBody: "Stripe confirms payment through a webhook. If confirmation lags for a few seconds, this page keeps checking before asking you to do anything.",
        missingSession: "Missing checkout session.",
        missingSessionBody: "Open checkout again from your cart to create a Stripe session.",
        returnToCart: "Return to cart",
        loadingOrder: "Loading order...",
        loadError: "Unable to load order",
        orderNumber: "Order number",
        paymentStatus: "Payment status",
        paymentMethod: "Payment method",
        processingTitle: "Processing payment",
        processingBodyA: "Stripe redirect completed, and this page is waiting for the webhook confirmation.",
        processingBodyB: "Checking again shortly.",
        processingBodyC: "Refresh if payment has already completed in Stripe.",
        successTitle: "Payment successful",
        successBodyFulfilled: "Your order is paid and already marked fulfilled.",
        successBodyPaid: "Your order is confirmed and ready for fulfillment. The cart has been cleared for the next session.",
        failureFallback: "No cart items were cleared. Review your kit and start checkout again when ready.",
        items: "Items",
        contactShipping: "Contact & shipping",
        country: "Country",
        shipping: "Shipping",
        billing: "Billing",
        amount: "Amount",
        subtotal: "Subtotal",
        shippingFee: "Shipping",
        discount: "Discount",
        total: "Total",
        retryCheckout: "Retry checkout",
        continueShopping: "Continue shopping",
        needHelp: "Need help?",
        support: "Support:",
        returnsPolicy: "Returns and policy:",
        reviewPolicy: "review the current policy",
        notProvided: "Not provided",
        pending: "Pending",
        each: "each",
        qty: "Qty",
        waitingWebhook: "Waiting for webhook confirmation",
        notAvailable: "Not available",
        status: {
          processing: "Processing payment",
          paid: "Payment successful",
          failed: "Payment failed",
          expired: "Checkout expired",
          fulfilled: "Order fulfilled",
          canceled: "Order canceled",
          refunded: "Refunded",
        },
        body: {
          fulfilled: "Payment is confirmed and the order has already been fulfilled by operations.",
          paid: "Payment is confirmed and the order is ready for fulfillment.",
          pending: "Stripe redirected you back. The order exists and the page is waiting for webhook confirmation.",
          failed: "Stripe did not confirm payment for this checkout session.",
          expired: "This checkout session expired before payment was completed.",
          canceled: "This order was canceled after checkout.",
          refunded: "Payment was completed earlier and has since been refunded.",
        },
      };
}
