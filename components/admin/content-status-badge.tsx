import type { AdminContentStatus } from "@/lib/admin-content-types";

const toneByStatus: Record<AdminContentStatus, string> = {
  DRAFT: "bg-graphite/10 text-muted",
  PUBLISHED: "bg-lime/20 text-graphite",
  ARCHIVED: "bg-red-100 text-red-700",
};

export function ContentStatusBadge({ status }: { status: AdminContentStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${toneByStatus[status]}`}>
      {status}
    </span>
  );
}
