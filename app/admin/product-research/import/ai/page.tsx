import { AdminProductResearchAiImportPageClient } from "@/components/admin/admin-product-research-import-tools-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchAiImportPage() {
  await requireAdminRole(["OPERATOR"]);
  return <AdminProductResearchAiImportPageClient />;
}
