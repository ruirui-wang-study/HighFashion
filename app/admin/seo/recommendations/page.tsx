import { AdminSeoRecommendationsPageClient } from "@/components/admin/admin-seo-recommendations-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoRecommendationsPage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoRecommendationsPageClient />;
}
