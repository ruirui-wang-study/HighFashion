import { AdminProductResearchAlibabaLinksPageClient } from "@/components/admin/admin-product-research-import-tools-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchAlibabaLinksPage() {
  await requireAdminRole(["OPERATOR"]);
  return <AdminProductResearchAlibabaLinksPageClient />;
}
