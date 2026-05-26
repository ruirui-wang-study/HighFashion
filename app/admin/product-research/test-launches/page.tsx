import { AdminProductResearchTestLaunchesPageClient } from "@/components/admin/admin-product-research-data-pages";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchTestLaunchesPage() {
  await requireAdminRole(["VIEWER"]);
  return <AdminProductResearchTestLaunchesPageClient />;
}
