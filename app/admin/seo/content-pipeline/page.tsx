import { AdminSeoContentPipelinePageClient } from "@/components/admin/admin-seo-content-pipeline-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoContentPipelinePage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoContentPipelinePageClient />;
}
