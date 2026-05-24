import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminMarketingPage() {
  await requireAdminRole(["ANALYST", "ADMIN", "SUPER_ADMIN"]);
  redirect("/admin/marketing/merchant-feed");
}
