import { AdminSeoOpportunitiesPageClient } from "@/components/admin/admin-seo-opportunities-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoOpportunitiesPage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoOpportunitiesPageClient />;
}
