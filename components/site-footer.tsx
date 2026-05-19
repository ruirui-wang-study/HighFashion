import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="bg-graphite px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_.8fr_.8fr]">
        <div>
          <p className="font-display text-4xl font-black uppercase tracking-[-0.06em]">Pulse<span className="text-lime">Gear</span></p>
          <p className="mt-4 max-w-md text-white/65">Lightweight support and carry essentials for running, training, and court sports.</p>
          <div className="mt-6 flex max-w-md gap-2 rounded-full bg-white/10 p-2">
            <input className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-white/40" placeholder="Email for training guides" />
            <Button variant="lime" size="sm">Join</Button>
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-lime">Shop</p>
          <div className="grid gap-3 text-sm text-white/70">
            <Link href="/shop">All gear</Link><Link href="/shop?useCase=Run">Run</Link><Link href="/shop?useCase=Train">Train</Link><Link href="/shop?useCase=Court">Court</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-lime">Support</p>
          <div className="grid gap-3 text-sm text-white/70">
            <Link href="/fit-guide">Fit Guide</Link><Link href="/guides">Guides</Link><Link href="/faq">Shipping & Returns</Link><Link href="/about">About</Link>
          </div>
          <div className="mt-6 flex gap-3 text-white/70"><Instagram /><Twitter /><Youtube /></div>
        </div>
      </div>
    </footer>
  );
}

