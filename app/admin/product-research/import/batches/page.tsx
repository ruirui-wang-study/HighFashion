import { AdminProductResearchImportBatchesPageClient } from "@/components/admin/admin-product-research-data-pages";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchImportBatchesPage() {
  await requireAdminRole(["VIEWER"]);
  return <AdminProductResearchImportBatchesPageClient />;
}
