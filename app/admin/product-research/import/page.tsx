import { AdminProductResearchImportPage } from "@/components/admin/admin-product-research-import-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchImportPageRoute() {
  await requireAdminRole(["OPERATOR"]);
  return <AdminProductResearchImportPage />;
}
