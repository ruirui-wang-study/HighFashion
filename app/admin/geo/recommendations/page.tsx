import { AdminGeoPage } from "@/components/admin/admin-geo-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminGeoRecommendationsRoute() {
  await requireAdminRole(["ANALYST", "ADMIN", "SUPER_ADMIN"]);
  return <AdminGeoPage />;
}
