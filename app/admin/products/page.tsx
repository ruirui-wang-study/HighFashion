import { AdminProductsPageClient } from "@/components/admin/admin-products-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminProductsPage() {
  await requireAdminRole(["OPERATOR"]);
  return <AdminProductsPageClient />;
}
