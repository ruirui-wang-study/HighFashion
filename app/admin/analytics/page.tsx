import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminAnalyticsPage() {
  await requireAdminRole(["ANALYST"]);
  redirect("/admin/analytics/sales");
}
