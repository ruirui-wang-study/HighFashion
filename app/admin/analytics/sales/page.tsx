import { AdminSalesAnalyticsPageClient } from "@/components/admin/admin-sales-analytics-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSalesAnalyticsPage() {
  await requireAdminRole(["ANALYST"]);
  return <AdminSalesAnalyticsPageClient />;
}
