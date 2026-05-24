export function AdminSeoHealthBadge({ score }: { score: number }) {
  const tone = score >= 85 ? "bg-lime/20 text-graphite" : score >= 60 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700";
  const label = score >= 85 ? "Healthy" : score >= 60 ? "Needs work" : "At risk";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${tone}`}>{label}</span>;
}
