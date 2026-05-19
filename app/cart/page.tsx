"use client";

import Link from "next/link";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { formatPrice } from "@/lib/utils";
import { itemKey, useCart } from "@/components/cart-provider";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, addItem } = useCart();
  const progress = Math.min((subtotal / 60) * 100, 100);
  const addons = ["gripflow-training-socks", "courtdry-sweatband-set", "chillflow-sport-bottle"]
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product) => product !== undefined);
  return (
    <Section>
      <Container>
        <SectionHeader eyebrow="Cart" title="Build your training kit" body="Checkout is intentionally disabled for this MVP. Cart state is local and ready to connect to Shopify or Stripe later." />
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.length === 0 ? <div className="rounded-[1.5rem] bg-white p-8"><p className="font-bold">Your cart is empty.</p><Button asChild className="mt-5" variant="lime"><Link href="/shop">Shop gear</Link></Button></div> : items.map((item) => {
              const key = itemKey(item);
              return <div key={key} className="flex gap-4 rounded-[1.5rem] bg-white p-4"><div className="h-24 w-24 rounded-2xl bg-graphite speed-lines" /><div className="flex-1"><p className="font-bold">{item.title}</p><p className="text-sm text-muted">{item.color} / {item.size}</p><div className="mt-3 flex items-center gap-3"><button className="rounded-full bg-warm px-3 py-1 font-bold" onClick={() => updateQuantity(key, item.quantity - 1)}>-</button><span className="font-bold">{item.quantity}</span><button className="rounded-full bg-warm px-3 py-1 font-bold" onClick={() => updateQuantity(key, item.quantity + 1)}>+</button><button className="text-xs font-bold uppercase tracking-[0.14em] text-muted" onClick={() => removeItem(key)}>Remove</button></div></div><p className="font-bold">{formatPrice(item.price * item.quantity)}</p></div>;
            })}
          </div>
          <aside className="rounded-[1.5rem] bg-white p-5 lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-bold">{subtotal >= 60 ? "Free shipping unlocked" : `${formatPrice(60 - subtotal)} to free shipping`}</p>
            <div className="mt-3 h-2 rounded-full bg-cool"><div className="h-2 rounded-full bg-lime" style={{ width: `${progress}%` }} /></div>
            <div className="mt-6 flex justify-between border-t border-graphite/10 pt-5 text-lg font-black"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <Button className="mt-5 w-full" size="lg" disabled>Checkout disabled</Button>
            <p className="mt-2 text-center text-xs text-muted">Payment integration coming soon.</p>
            <div className="mt-6 space-y-3"><p className="text-xs font-bold uppercase tracking-[0.18em]">Recommended add-ons</p>{addons.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-warm p-3"><Link href={`/products/${product.slug}`} className="text-sm font-bold">{product.title} <span className="text-muted">{formatPrice(product.price)}</span></Link><Button size="sm" variant="lime" onClick={() => addItem({ product, color: product.colors[0], size: product.sizes[0] })}>Add</Button></div>)}</div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}


