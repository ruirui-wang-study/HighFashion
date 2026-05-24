import type { ReactNode } from "react";

export function AdminTablePanel({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{title}</p>
        {body ? <p className="mt-2 text-sm leading-6 text-muted">{body}</p> : null}
      </div>
      <div className="mt-5 overflow-x-auto">{children}</div>
    </section>
  );
}
