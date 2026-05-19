"use client";

import { useMemo, useState } from "react";
import { CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCents, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart-provider";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const firstVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const [color, setColor] = useState(firstVariant?.color ?? product.colors[0]);
  const [size, setSize] = useState(firstVariant?.size ?? product.sizes[0]);
  const { addItem } = useCart();

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.color === color && variant.size === size),
    [product.variants, color, size],
  );
  const availableSizes = product.sizes.map((item) => ({
    size: item,
    variant: product.variants.find((variant) => variant.color === color && variant.size === item),
  }));
  const priceCents = selectedVariant?.priceCents ?? product.priceCents;
  const compareAtPriceCents = selectedVariant?.compareAtPriceCents ?? product.compareAtPriceCents;
  const canAdd = selectedVariant && selectedVariant.stock > 0 && selectedVariant.active;
  const add = () => {
    if (selectedVariant && canAdd) addItem({ product, variant: selectedVariant });
  };

  return (
    <div className="lg:sticky lg:top-24">
      <Badge>{product.badge}</Badge>
      <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.86] tracking-[-0.06em] sm:text-6xl">{product.title}</h1>
      <div className="mt-4 flex items-center gap-4 text-sm font-bold"><span>{product.rating} / 5 rating</span><span className="text-muted">{product.reviewCount} reviews</span></div>
      <div className="mt-5 flex items-end gap-3"><p className="text-3xl font-black">{formatCents(priceCents)}</p>{compareAtPriceCents ? <p className="pb-1 text-lg text-muted line-through">{formatCents(compareAtPriceCents)}</p> : null}</div>
      <p className="mt-5 text-lg leading-8 text-muted">{product.shortDescription}</p>
      <div className="mt-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em]">Color: {color}</p>
        <div className="flex flex-wrap gap-2">{product.colors.map((item) => <button key={item} onClick={() => setColor(item)} className={cn("rounded-full border px-4 py-2 text-sm font-bold", color === item ? "border-graphite bg-graphite text-white" : "border-graphite/15 bg-white")}>{item}</button>)}</div>
      </div>
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.18em]">Size</p><a href="#fit-guide" className="text-xs font-bold uppercase tracking-[0.12em] text-signal">Fit guide</a></div>
        <div className="grid grid-cols-4 gap-2">{availableSizes.map(({ size: item, variant }) => {
          const out = !variant || variant.stock <= 0 || !variant.active;
          return <button key={item} disabled={out} onClick={() => setSize(item)} className={cn("rounded-2xl border px-3 py-3 text-sm font-black", size === item ? "border-graphite bg-lime" : "border-graphite/15 bg-white", out && "cursor-not-allowed opacity-40")}>{item}<span className="block text-[10px] font-bold normal-case tracking-normal">{out ? "Out" : `${variant.stock} left`}</span></button>;
        })}</div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">{product.useCases.map((item) => <span key={item} className="rounded-full bg-cool px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">{item}</span>)}</div>
      <Button size="lg" variant="lime" className="mt-7 w-full" disabled={!canAdd} onClick={add}>{canAdd ? "Add to cart" : "Out of stock"}</Button>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[{ icon: Truck, text: "Free shipping $60+" }, { icon: RotateCcw, text: "30-day returns" }, { icon: CreditCard, text: "Secure checkout" }, { icon: ShieldCheck, text: "Fit guarantee" }].map(({ icon: Icon, text }) => (
          <div key={text} className="rounded-2xl border border-graphite/10 bg-white p-3 text-sm font-bold"><Icon className="mb-2 h-5 w-5 text-signal" />{text}</div>
        ))}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-graphite/10 bg-warm/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3"><div className="flex-1"><p className="text-sm font-bold">{product.title}</p><p className="text-xs text-muted">{color} / {size}</p></div><Button variant="lime" disabled={!canAdd} onClick={add}>Add {formatCents(priceCents)}</Button></div>
      </div>
    </div>
  );
}
