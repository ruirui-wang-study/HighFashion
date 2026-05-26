import { AdminProductResearchSuppliersPageClient } from "@/components/admin/admin-product-research-data-pages";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchSuppliersPage() {
  await requireAdminRole(["VIEWER"]);
  return <AdminProductResearchSuppliersPageClient />;
}
