"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { createCheckoutSession, getProducts } from "@/lib/api-client";
import { formatCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { itemKey, useCart } from "@/components/cart-provider";

const addonSlugs = ["gripflow-training-socks", "courtdry-sweatband-set", "chillflow-sport-bottle"];

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotalCents, addItem } = useCart();
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
    <Dialog.Root open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-graphite/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-warm p-5 shadow-utility sm:p-6">
          <div className="flex items-center justify-between"><Dialog.Title className="font-display text-3xl font-black uppercase tracking-[-0.05em]">Training kit</Dialog.Title><Dialog.Close className="rounded-full border border-graphite/10 p-2"><X className="h-5 w-5" /></Dialog.Close></div>
          <div className="mt-5 rounded-2xl bg-white p-4"><div className="flex items-center justify-between text-sm font-bold"><span>{subtotalCents >= 6000 ? "Free shipping unlocked" : `${formatCents(6000 - subtotalCents)} to free shipping`}</span><span>{formatCents(subtotalCents)}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-cool"><div className="h-full rounded-full bg-lime" style={{ width: `${progress}%` }} /></div></div>
          <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
            {items.length === 0 ? <div className="rounded-3xl border border-dashed border-graphite/20 p-8 text-center"><ShoppingBag className="mx-auto h-8 w-8" /><p className="mt-3 font-bold">Your cart is ready for gear.</p><p className="mt-2 text-sm text-muted">Add support, carry, or sweat-ready essentials.</p></div> : items.map((item) => {
              const key = itemKey(item);
              return <div key={key} className="rounded-3xl bg-white p-4"><div className="flex gap-4"><div className="h-20 w-20 rounded-2xl bg-graphite speed-lines" /><div className="flex-1"><Link href={`/products/${item.slug}`} className="font-bold" onClick={closeCart}>{item.title}</Link><p className="text-sm text-muted">{item.color} / {item.size}</p><div className="mt-3 flex items-center justify-between"><div className="flex items-center rounded-full border border-graphite/10"><button className="p-2" onClick={() => updateQuantity(key, item.quantity - 1)}><Minus className="h-4 w-4" /></button><span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span><button className="p-2" onClick={() => updateQuantity(key, item.quantity + 1)}><Plus className="h-4 w-4" /></button></div><button className="text-xs font-bold uppercase tracking-[0.12em] text-muted" onClick={() => removeItem(key)}>Remove</button></div></div><p className="font-bold">{formatCents(item.unitPriceCents * item.quantity)}</p></div></div>;
            })}
            <div className="rounded-3xl bg-graphite p-4 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-lime">Recommended add-ons</p><div className="mt-3 space-y-3">{addons.map((product) => { const variant = product.variants.find((item) => item.stock > 0); return <div key={product.id} className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold">{product.title}</p><p className="text-xs text-white/60">{formatCents(product.priceCents)}</p></div><Button size="sm" variant="lime" disabled={!variant} onClick={() => variant ? addItem({ product, variant }) : undefined}>Add</Button></div>; })}</div></div>
          </div>
          <div className="border-t border-graphite/10 pt-5"><div className="flex items-center justify-between font-bold"><span>Subtotal</span><span>{formatCents(subtotalCents)}</span></div><Button className="mt-4 w-full" size="lg" disabled={items.length === 0 || checkingOut} onClick={checkout}>{checkingOut ? "Starting checkout" : "Checkout"}</Button>{error ? <p className="mt-2 text-center text-xs font-bold text-red-600">{error}</p> : <p className="mt-2 text-center text-xs text-muted">Secure checkout powered by Stripe.</p>}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
