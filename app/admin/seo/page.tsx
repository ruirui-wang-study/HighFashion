import { AdminSeoOverviewPageClient } from "@/components/admin/admin-seo-overview-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoPage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoOverviewPageClient />;
}
