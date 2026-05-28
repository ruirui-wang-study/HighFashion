import { AdminCommerceRulesPage } from "@/components/admin/admin-commerce-rules-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminCommerceRulesRoute() {
  await requireAdminRole(["ADMIN", "SUPER_ADMIN"]);
  return <AdminCommerceRulesPage />;
}
