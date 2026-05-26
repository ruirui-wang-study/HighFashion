import { AdminProductResearchDashboardPageClient } from "@/components/admin/admin-product-research-dashboard-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchDashboardPage() {
  await requireAdminRole(["VIEWER"]);
  return <AdminProductResearchDashboardPageClient />;
}
