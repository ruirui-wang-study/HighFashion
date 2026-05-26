import { AdminProductResearchCandidateDetailPageClient } from "@/components/admin/admin-product-research-candidate-detail-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductResearchCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminRole(["VIEWER"]);
  const { id } = await params;
  return <AdminProductResearchCandidateDetailPageClient id={id} />;
}
