import { AdminProductResearchCandidatesPageClient } from "@/components/admin/admin-product-research-candidates-list-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchCandidatesPage() {
  await requireAdminRole(["VIEWER"]);
  return <AdminProductResearchCandidatesPageClient />;
}
