import { AdminProductResearchScoringRulesPageClient } from "@/components/admin/admin-product-research-data-pages";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchScoringRulesPage() {
  await requireAdminRole(["ADMIN"]);
  return <AdminProductResearchScoringRulesPageClient />;
}
