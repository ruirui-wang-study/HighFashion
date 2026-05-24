import { AdminInventoryPageClient } from "@/components/admin/admin-inventory-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminInventoryPage() {
  await requireAdminRole(["OPERATOR"]);
  return <AdminInventoryPageClient />;
}
