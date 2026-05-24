import type { ReactNode } from "react";
import type { AdminAnalyticsConnection } from "@/lib/admin-analytics-types";
import { AdminConnectionBadge } from "./admin-connection-badge";

export function AdminChartPanel({
  title,
  body,
  ga4,
  children,
}: {
  title: string;
  body?: string;
  ga4?: AdminAnalyticsConnection;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{title}</p>
          {body ? <p className="mt-2 text-sm leading-6 text-muted">{body}</p> : null}
        </div>
        {ga4 ? <AdminConnectionBadge ga4={ga4} /> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AdminLineChart({
  values,
  labels,
  formatter,
}: {
  values: number[];
  labels: string[];
  formatter: (value: number) => string;
}) {
  if (values.length === 0) {
    return <div className="rounded-2xl bg-warm p-6 text-sm text-muted">No data in the selected range.</div>;
  }

  const width = 640;
  const height = 220;
  const padding = 20;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : padding + (index * (width - padding * 2)) / (values.length - 1);
    const y = height - padding - (value / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-2xl bg-warm">
        <polyline fill="none" stroke="currentColor" strokeWidth="4" points={points} className="text-signal" />
        {values.map((value, index) => {
          const x = values.length === 1 ? width / 2 : padding + (index * (width - padding * 2)) / (values.length - 1);
          const y = height - padding - (value / max) * (height - padding * 2);
          return <circle key={`${labels[index]}-${value}`} cx={x} cy={y} r="5" className="fill-graphite" />;
        })}
      </svg>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {labels.map((label, index) => (
          <div key={label} className="rounded-2xl bg-warm p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
            <p className="mt-2 text-sm font-bold text-graphite">{formatter(values[index] ?? 0)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminBarChart({
  rows,
  formatter,
}: {
  rows: Array<{ label: string; value: number; meta?: string }>;
  formatter: (value: number) => string;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="space-y-3">
      {rows.length === 0 ? <div className="rounded-2xl bg-warm p-6 text-sm text-muted">No data in the selected range.</div> : null}
      {rows.map((row) => (
        <div key={row.label} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="font-bold text-graphite">{row.label}</p>
            <div className="text-right">
              <p className="font-bold text-graphite">{formatter(row.value)}</p>
              {row.meta ? <p className="text-xs text-muted">{row.meta}</p> : null}
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-warm">
            <div className="h-full rounded-full bg-signal" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminFunnelChart({
  steps,
}: {
  steps: Array<{ label: string; value: number; dropOffRate: number }>;
}) {
  const max = Math.max(...steps.map((step) => step.value), 1);
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.label} className="rounded-2xl bg-warm p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Step {index + 1}</p>
              <p className="mt-1 font-bold text-graphite">{step.label}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-black text-graphite">{step.value}</p>
              <p className="text-xs text-muted">{Math.round(step.dropOffRate * 100)}% drop-off</p>
            </div>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-signal" style={{ width: `${(step.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
