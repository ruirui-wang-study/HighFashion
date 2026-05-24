import { AdminSeoIssuesPageClient } from "@/components/admin/admin-seo-issues-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminSeoIssuesPage() {
  await requireAdminRole(["CONTENT_EDITOR"]);
  return <AdminSeoIssuesPageClient />;
}
