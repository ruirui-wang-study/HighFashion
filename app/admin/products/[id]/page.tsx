import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminRole(["OPERATOR"]);
  const { id } = await params;
  return <AdminProductEditor productId={id} />;
}
