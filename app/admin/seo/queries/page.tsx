import { AdminSeoQueriesPageClient } from "@/components/admin/admin-seo-queries-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoQueriesPage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoQueriesPageClient />;
}
