import { AdminSeoAutomationPageClient } from "@/components/admin/admin-seo-automation-dashboard-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoAutomationPage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoAutomationPageClient />;
}
