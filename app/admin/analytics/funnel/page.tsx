import { AdminFunnelAnalyticsPageClient } from "@/components/admin/admin-funnel-analytics-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminFunnelAnalyticsPage() {
  await requireAdminRole(["ANALYST"]);
  return <AdminFunnelAnalyticsPageClient />;
}
