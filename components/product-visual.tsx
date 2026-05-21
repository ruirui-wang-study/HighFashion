import { Activity, Droplets, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import { resolveProductImage } from "@/lib/product-image-map";
import { cn } from "@/lib/utils";

const iconMap = [Activity, ShieldCheck, Truck, Droplets];

export function ProductVisual({ label, image, className }: { label: string; image?: string; className?: string }) {
  const src = resolveProductImage(image);

  if (src) {
    return (
      <div className={cn("relative min-h-72 overflow-hidden rounded-[1.75rem] bg-cool", className)}>
        <Image src={src} alt={label} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/30 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-72 overflow-hidden rounded-[1.75rem] bg-graphite p-5 text-white speed-lines", className)}>
      <div className="absolute inset-0 bg-grid bg-[size:26px_26px] opacity-20" />
      <div className="absolute -right-8 bottom-0 h-56 w-32 rotate-12 rounded-t-full border border-white/20 bg-white/10" />
      <div className="absolute bottom-8 left-8 h-36 w-16 rounded-full border border-lime/40 bg-lime/10" />
      <div className="relative flex h-full min-h-60 flex-col justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Use-scale placeholder</p>
        <div>
          <p className="font-display text-4xl font-black uppercase leading-none tracking-[-0.05em]">{label}</p>
          <p className="mt-2 max-w-52 text-xs text-white/60">Scene block for body proportion, movement, and product-in-use framing.</p>
        </div>
      </div>
    </div>
  );
}

export function BenefitGrid({ benefits }: { benefits: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {benefits.slice(0, 4).map((benefit, index) => {
        const Icon = iconMap[index] ?? ShieldCheck;
        return (
          <div key={benefit} className="rounded-3xl border border-graphite/10 bg-white p-4">
            <Icon className="h-5 w-5 text-signal" />
            <p className="mt-3 text-sm font-bold leading-tight">{benefit}</p>
          </div>
        );
      })}
    </div>
  );
}
