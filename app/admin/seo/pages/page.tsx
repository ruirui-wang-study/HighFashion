import { AdminSeoPagesPageClient } from "@/components/admin/admin-seo-pages-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoPagesPage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoPagesPageClient />;
}
