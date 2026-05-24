"use client";

import { Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import { useCart } from "@/components/cart-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/components/locale-provider";

const nav = [
  { href: "/collection", key: "shop" },
  { href: "/shop?useCase=Run", key: "run" },
  { href: "/shop?useCase=Train", key: "train" },
  { href: "/shop?useCase=Court", key: "court" },
  { href: "/guides", key: "guides" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { openCart, itemCount } = useCart();
  const { messages } = useLocale();
  return (
    <>
      <div className="bg-graphite px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-white">
        {messages.site.promo}
      </div>
      <header className="sticky top-0 z-40 border-b border-graphite/10 bg-warm/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-2xl font-black uppercase tracking-[-0.06em]">Pulse<span className="text-signal">Gear</span></Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((item) => <Link key={item.key} href={item.href} className="text-sm font-bold uppercase tracking-[0.14em] text-graphite/75 hover:text-graphite">{messages.site.nav[item.key]}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle className="hidden md:inline-flex" />
            <Button variant="ghost" size="icon" className="relative" onClick={openCart} aria-label={messages.site.openCart}>
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 ? <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-lime text-[10px] font-black text-graphite">{itemCount}</span> : null}
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label={messages.site.openMenu}>{open ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-graphite/10 bg-warm px-4 py-5 lg:hidden">
            <div className="grid gap-3">
              <div className="pb-2">
                <LanguageToggle />
              </div>
              {nav.map((item) => <Link key={item.key} href={item.href} onClick={() => setOpen(false)} className="rounded-2xl bg-white px-4 py-4 text-sm font-bold uppercase tracking-[0.14em]">{messages.site.nav[item.key]}</Link>)}
              <Link href="/fit-guide" onClick={() => setOpen(false)} className="rounded-2xl bg-lime px-4 py-4 text-sm font-bold uppercase tracking-[0.14em]">{messages.site.nav.fitGuide}</Link>
            </div>
          </div>
        ) : null}
      </header>
      <CartDrawer />
    </>
  );
}

