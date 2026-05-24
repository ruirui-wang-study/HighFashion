import { AdminSeoChangeLogPageClient } from "@/components/admin/admin-seo-change-log-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoChangeLogPage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoChangeLogPageClient />;
}
