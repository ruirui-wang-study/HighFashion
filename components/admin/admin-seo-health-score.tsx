import { AdminSeoHealthBadge } from "./admin-seo-health-badge";

export function AdminSeoHealthScore({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <p className="font-display text-2xl font-black text-graphite">{score}</p>
      <AdminSeoHealthBadge score={score} />
    </div>
  );
}
