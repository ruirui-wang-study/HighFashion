import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("inline-flex items-center rounded-full border border-graphite/10 bg-lime px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-graphite", className)}
      {...props}
    />
  );
}
