import { AdminSeoInternalLinksPageClient } from "@/components/admin/admin-seo-internal-links-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoInternalLinksPage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoInternalLinksPageClient />;
}
