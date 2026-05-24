import { AdminDashboardPageClient } from "@/components/admin/admin-dashboard-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminDashboardPage() {
  await requireAdminRole(["VIEWER"]);
  return <AdminDashboardPageClient />;
}
