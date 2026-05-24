export function AdminPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">{title}</p>
      <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-[-0.05em]">{title}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{body}</p>
    </div>
  );
}
