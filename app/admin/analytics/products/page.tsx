import { AdminProductAnalyticsPageClient } from "@/components/admin/admin-product-analytics-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductAnalyticsPage() {
  await requireAdminRole(["ANALYST"]);
  return <AdminProductAnalyticsPageClient />;
}
