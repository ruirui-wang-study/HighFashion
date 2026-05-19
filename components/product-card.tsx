"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCents } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "@/components/product-visual";
import { useCart } from "@/components/cart-provider";

const colorClass: Record<string, string> = {
  Graphite: "bg-graphite",
  Steel: "bg-cool",
  Lime: "bg-lime",
  "Signal Blue": "bg-signal",
  White: "bg-white",
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const firstAvailableVariant = product.variants.find((variant) => variant.stock > 0 && variant.active) ?? product.variants[0];
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-graphite/10 bg-white p-3 transition hover:-translate-y-1 hover:shadow-utility">
      <Link href={`/products/${product.slug}`}>
        <ProductVisual label={product.title} className="min-h-64" />
      </Link>
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge className="bg-graphite text-white">{product.badge}</Badge>
          <div className="flex items-center gap-1 text-sm font-bold"><Star className="h-4 w-4 fill-lime text-graphite" />{product.rating}</div>
        </div>
        <Link href={`/products/${product.slug}`} className="font-display text-2xl font-black uppercase leading-none tracking-[-0.04em] hover:text-signal">{product.title}</Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{product.shortDescription}</p>
        <div className="mt-4 flex items-center justify-between">
          <div><span className="font-bold">{formatCents(product.priceCents)}</span>{product.compareAtPriceCents ? <span className="ml-2 text-sm text-muted line-through">{formatCents(product.compareAtPriceCents)}</span> : null}</div>
          <div className="flex -space-x-1">
            {product.colors.slice(0, 4).map((color) => <span key={color} className={`h-4 w-4 rounded-full border border-graphite/20 ${colorClass[color] ?? "bg-cool"}`} />)}
          </div>
        </div>
        <Button className="mt-4 w-full" variant="outline" disabled={!firstAvailableVariant} onClick={() => firstAvailableVariant ? addItem({ product, variant: firstAvailableVariant }) : undefined}>Quick add</Button>
      </div>
    </article>
  );
}

