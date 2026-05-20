"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { createCheckoutSession, getProducts } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { formatCents } from "@/lib/utils";
import { itemKey, useCart } from "@/components/cart-provider";

const addonSlugs = ["gripflow-training-socks", "courtdry-sweatband-set", "chillflow-sport-bottle"];

export function CartPageClient() {
  const { items, subtotalCents, updateQuantity, removeItem, addItem } = useCart();
  const [addons, setAddons] = useState<Product[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progress = Math.min((subtotalCents / 6000) * 100, 100);

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
      setError(err instanceof Error ? err.message : "Unable to start checkout");
      setCheckingOut(false);
    }
  };

  return (
    <Section>
      <Container>
        <SectionHeader eyebrow="Cart" title="Build your training kit" body="Checkout validates prices, stock, and shipping on the API before redirecting to Stripe." />
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.length === 0 ? <div className="rounded-[1.5rem] bg-white p-8"><p className="font-bold">Your cart is empty.</p><Button asChild className="mt-5" variant="lime"><Link href="/shop">Shop gear</Link></Button></div> : items.map((item) => {
              const key = itemKey(item);
              return <div key={key} className="flex gap-4 rounded-[1.5rem] bg-white p-4"><div className="h-24 w-24 rounded-2xl bg-graphite speed-lines" /><div className="flex-1"><p className="font-bold">{item.title}</p><p className="text-sm text-muted">{item.color} / {item.size}</p><div className="mt-3 flex items-center gap-3"><button className="rounded-full bg-warm px-3 py-1 font-bold" onClick={() => updateQuantity(key, item.quantity - 1)}>-</button><span className="font-bold">{item.quantity}</span><button className="rounded-full bg-warm px-3 py-1 font-bold" onClick={() => updateQuantity(key, item.quantity + 1)}>+</button><button className="text-xs font-bold uppercase tracking-[0.14em] text-muted" onClick={() => removeItem(key)}>Remove</button></div></div><p className="font-bold">{formatCents(item.unitPriceCents * item.quantity)}</p></div>;
            })}
          </div>
          <aside className="rounded-[1.5rem] bg-white p-5 lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-bold">{subtotalCents >= 6000 ? "Free shipping unlocked" : `${formatCents(6000 - subtotalCents)} to free shipping`}</p>
            <div className="mt-3 h-2 rounded-full bg-cool"><div className="h-2 rounded-full bg-lime" style={{ width: `${progress}%` }} /></div>
            <div className="mt-6 flex justify-between border-t border-graphite/10 pt-5 text-lg font-black"><span>Subtotal</span><span>{formatCents(subtotalCents)}</span></div>
            <Button className="mt-5 w-full" size="lg" disabled={items.length === 0 || checkingOut} onClick={checkout}>{checkingOut ? "Starting checkout" : "Checkout"}</Button>
            {error ? <p className="mt-2 text-center text-xs font-bold text-red-600">{error}</p> : <p className="mt-2 text-center text-xs text-muted">Payment methods are selected by Stripe Checkout.</p>}
            <div className="mt-6 space-y-3"><p className="text-xs font-bold uppercase tracking-[0.18em]">Recommended add-ons</p>{addons.map((product) => { const variant = product.variants.find((item) => item.stock > 0); return <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-warm p-3"><Link href={`/products/${product.slug}`} className="text-sm font-bold">{product.title} <span className="text-muted">{formatCents(product.priceCents)}</span></Link><Button size="sm" variant="lime" disabled={!variant} onClick={() => variant ? addItem({ product, variant }) : undefined}>Add</Button></div>; })}</div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
