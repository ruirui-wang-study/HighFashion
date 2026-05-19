"use client";

import { Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import { useCart } from "@/components/cart-provider";

const nav = [
  { href: "/collection", label: "Shop" },
  { href: "/shop?useCase=Run", label: "Run" },
  { href: "/shop?useCase=Train", label: "Train" },
  { href: "/shop?useCase=Court", label: "Court" },
  { href: "/guides", label: "Guides" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { openCart, itemCount } = useCart();
  return (
    <>
      <div className="bg-graphite px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-white">
        Free shipping over $60 / 30-day returns
      </div>
      <header className="sticky top-0 z-40 border-b border-graphite/10 bg-warm/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-2xl font-black uppercase tracking-[-0.06em]">Pulse<span className="text-signal">Gear</span></Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((item) => <Link key={item.label} href={item.href} className="text-sm font-bold uppercase tracking-[0.14em] text-graphite/75 hover:text-graphite">{item.label}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={openCart} aria-label="Open cart">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 ? <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-lime text-[10px] font-black text-graphite">{itemCount}</span> : null}
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open menu">{open ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-graphite/10 bg-warm px-4 py-5 lg:hidden">
            <div className="grid gap-3">
              {nav.map((item) => <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="rounded-2xl bg-white px-4 py-4 text-sm font-bold uppercase tracking-[0.14em]">{item.label}</Link>)}
              <Link href="/fit-guide" onClick={() => setOpen(false)} className="rounded-2xl bg-lime px-4 py-4 text-sm font-bold uppercase tracking-[0.14em]">Fit Guide</Link>
            </div>
          </div>
        ) : null}
      </header>
      <CartDrawer />
    </>
  );
}

