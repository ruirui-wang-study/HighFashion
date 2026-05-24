import { AdminSettingsPage } from "@/components/admin/admin-settings-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSettingsRoute() {
  await requireAdminRole(["ADMIN"]);
  return <AdminSettingsPage />;
}
