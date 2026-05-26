import { AdminProductResearchNewCandidatePageClient } from "@/components/admin/admin-product-research-new-candidate-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchNewCandidatePage() {
  await requireAdminRole(["OPERATOR"]);
  return <AdminProductResearchNewCandidatePageClient />;
}
