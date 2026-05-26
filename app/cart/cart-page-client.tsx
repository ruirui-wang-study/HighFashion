"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import type { Product } from "@/lib/types";
import { createCheckoutSession, getProducts } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { formatCents } from "@/lib/utils";
import { itemKey, useCart } from "@/components/cart-provider";

const addonSlugs = ["gripflow-training-socks", "courtdry-sweatband-set", "chillflow-sport-bottle"];

export function CartPageClient() {
  const { locale } = useLocale();
  const { items, subtotalCents, updateQuantity, removeItem, addItem, syncMessage, dismissSyncMessage } = useCart();
  const [addons, setAddons] = useState<Product[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progress = Math.min((subtotalCents / 6000) * 100, 100);
  const copy = locale === "zh"
    ? {
        eyebrow: "购物车",
        title: "搭建你的训练套装",
        body: "结账前会由 API 再次校验价格、库存和配送信息，然后再跳转到 Stripe。",
        dismiss: "关闭",
        empty: "你的购物车还是空的。",
        shopGear: "去选购",
        remove: "删除",
        freeShippingUnlocked: "已解锁免运费",
        toFreeShipping: "即可免运费",
        subtotal: "小计",
        startingCheckout: "正在创建结账",
        checkout: "去结账",
        paymentMethods: "支付方式由 Stripe Checkout 提供。",
        recommendedAddons: "推荐加购",
        add: "加入",
        unable: "无法开始结账",
      }
    : {
        eyebrow: "Cart",
        title: "Build your training kit",
        body: "Checkout validates prices, stock, and shipping on the API before redirecting to Stripe.",
        dismiss: "Dismiss",
        empty: "Your cart is empty.",
        shopGear: "Shop gear",
        remove: "Remove",
        freeShippingUnlocked: "Free shipping unlocked",
        toFreeShipping: "to free shipping",
        subtotal: "Subtotal",
        startingCheckout: "Starting checkout",
        checkout: "Checkout",
        paymentMethods: "Payment methods are selected by Stripe Checkout.",
        recommendedAddons: "Recommended add-ons",
        add: "Add",
        unable: "Unable to start checkout",
      };

  useEffect(() => {
    getProducts().then((result) => setAddons(addonSlugs.map((slug) => result.find((product) => product.slug === slug)).filter((product): product is Product => Boolean(product)))).catch(() => setAddons([]));
  }, []);

  const checkout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      const session = await createCheckoutSession({ items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })) });
      window.location.href = session.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.unable);
      setCheckingOut(false);
    }
  };

  return (
    <Section>
      <Container>
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
        {syncMessage ? (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-[1.5rem] border border-lime/40 bg-lime/10 p-4 text-sm">
            <p className="font-bold text-graphite">{syncMessage}</p>
            <button className="text-xs font-bold uppercase tracking-[0.14em] text-muted" onClick={dismissSyncMessage}>{copy.dismiss}</button>
          </div>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.length === 0 ? <div className="rounded-[1.5rem] bg-white p-8"><p className="font-bold">{copy.empty}</p><Button asChild className="mt-5" variant="lime"><Link href="/shop">{copy.shopGear}</Link></Button></div> : items.map((item) => {
              const key = itemKey(item);
              return <div key={key} className="flex gap-4 rounded-[1.5rem] bg-white p-4"><div className="h-24 w-24 rounded-2xl bg-graphite speed-lines" /><div className="flex-1"><p className="font-bold">{item.title}</p><p className="text-sm text-muted">{item.color} / {item.size}</p><div className="mt-3 flex items-center gap-3"><button className="rounded-full bg-warm px-3 py-1 font-bold" onClick={() => updateQuantity(key, item.quantity - 1)}>-</button><span className="font-bold">{item.quantity}</span><button className="rounded-full bg-warm px-3 py-1 font-bold" onClick={() => updateQuantity(key, item.quantity + 1)}>+</button><button className="text-xs font-bold uppercase tracking-[0.14em] text-muted" onClick={() => removeItem(key)}>{copy.remove}</button></div></div><p className="font-bold">{formatCents(item.unitPriceCents * item.quantity)}</p></div>;
            })}
          </div>
          <aside className="rounded-[1.5rem] bg-white p-5 lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-bold">{subtotalCents >= 6000 ? copy.freeShippingUnlocked : `${formatCents(6000 - subtotalCents)} ${copy.toFreeShipping}`}</p>
            <div className="mt-3 h-2 rounded-full bg-cool"><div className="h-2 rounded-full bg-lime" style={{ width: `${progress}%` }} /></div>
            <div className="mt-6 flex justify-between border-t border-graphite/10 pt-5 text-lg font-black"><span>{copy.subtotal}</span><span>{formatCents(subtotalCents)}</span></div>
            <Button className="mt-5 w-full" size="lg" disabled={items.length === 0 || checkingOut} onClick={checkout}>{checkingOut ? copy.startingCheckout : copy.checkout}</Button>
            {error ? <p className="mt-2 text-center text-xs font-bold text-red-600">{error}</p> : <p className="mt-2 text-center text-xs text-muted">{copy.paymentMethods}</p>}
            <div className="mt-6 space-y-3"><p className="text-xs font-bold uppercase tracking-[0.18em]">{copy.recommendedAddons}</p>{addons.map((product) => { const variant = product.variants.find((item) => item.stock > 0); return <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-warm p-3"><Link href={`/products/${product.slug}`} className="text-sm font-bold">{product.title} <span className="text-muted">{formatCents(product.priceCents)}</span></Link><Button size="sm" variant="lime" disabled={!variant} onClick={() => variant ? addItem({ product, variant }) : undefined}>{copy.add}</Button></div>; })}</div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
