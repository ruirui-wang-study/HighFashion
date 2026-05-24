import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminPageHeader({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-graphite/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-[-0.05em] text-graphite">{title}</h1>
        {body ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{body}</p> : null}
      </div>
      {action ? (
        <Button asChild variant="lime">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
