export function AdminKpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl font-black text-graphite">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
