import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminNewProductPage() {
  await requireAdminRole(["OPERATOR"]);
  return <AdminProductEditor />;
}
