import { AdminProductResearchCsvImportPageClient } from "@/components/admin/admin-product-research-import-tools-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchCsvImportPage() {
  await requireAdminRole(["OPERATOR"]);
  return <AdminProductResearchCsvImportPageClient />;
}
