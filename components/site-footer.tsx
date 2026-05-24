"use client";

import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export function SiteFooter({
  brandName,
  supportEmail,
  returnsPolicyUrl,
  shippingCopy,
  returnsCopy,
}: {
  brandName?: string;
  supportEmail?: string | null;
  returnsPolicyUrl?: string | null;
  shippingCopy?: string | null;
  returnsCopy?: string | null;
}) {
  const { messages } = useLocale();
  return (
    <footer className="bg-graphite px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_.8fr_.8fr]">
        <div>
          <p className="font-display text-4xl font-black uppercase tracking-[-0.06em]">{brandName ?? "PulseGear"}</p>
          <p className="mt-4 max-w-md text-white/65">{messages.site.footer.description}</p>
          {shippingCopy || returnsCopy ? (
            <p className="mt-3 max-w-md text-sm text-white/50">{[shippingCopy, returnsCopy].filter(Boolean).join(" / ")}</p>
          ) : null}
          <div className="mt-6 flex max-w-md gap-2 rounded-full bg-white/10 p-2">
            <input className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-white/40" placeholder={messages.site.footer.newsletterPlaceholder} />
            <Button variant="lime" size="sm">{messages.site.footer.join}</Button>
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-lime">{messages.site.footer.shop}</p>
          <div className="grid gap-3 text-sm text-white/70">
            <Link href="/shop">{messages.site.footer.allGear}</Link>
            <Link href="/shop?useCase=Run">{messages.site.nav.run}</Link>
            <Link href="/shop?useCase=Train">{messages.site.nav.train}</Link>
            <Link href="/shop?useCase=Court">{messages.site.nav.court}</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-lime">{messages.site.footer.support}</p>
          <div className="grid gap-3 text-sm text-white/70">
            <Link href="/fit-guide">{messages.site.nav.fitGuide}</Link>
            <Link href="/guides">{messages.site.footer.trainingGuides}</Link>
            <Link href={returnsPolicyUrl || "/faq"}>{messages.site.footer.shippingReturns}</Link>
            <Link href="/about">{messages.site.footer.about}</Link>
            {supportEmail ? <a href={`mailto:${supportEmail}`}>{supportEmail}</a> : null}
          </div>
          <div className="mt-6 flex gap-3 text-white/70"><Instagram /><Twitter /><Youtube /></div>
        </div>
      </div>
    </footer>
  );
}
