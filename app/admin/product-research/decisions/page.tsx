import { AdminProductResearchDecisionsPageClient } from "@/components/admin/admin-product-research-data-pages";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchDecisionsPage() {
  await requireAdminRole(["VIEWER"]);
  return <AdminProductResearchDecisionsPageClient />;
}
