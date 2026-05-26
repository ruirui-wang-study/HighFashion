import { AdminProductResearchRiskReviewPageClient } from "@/components/admin/admin-product-research-risk-review-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchRiskReviewPage() {
  await requireAdminRole(["VIEWER"]);
  return <AdminProductResearchRiskReviewPageClient />;
}
