import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("px-4 py-14 sm:px-6 lg:px-8 lg:py-20", className)} {...props} />;
}

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl", className)} {...props} />;
}

export function SectionHeader({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-signal">{eyebrow}</p> : null}
      <h2 className="font-display text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-graphite sm:text-5xl">{title}</h2>
      {body ? <p className="mt-4 text-base leading-7 text-muted sm:text-lg">{body}</p> : null}
    </div>
  );
}
