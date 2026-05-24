import { AdminMerchantFeedPageClient } from "@/components/admin/admin-merchant-feed-page";
import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminMerchantFeedPage() {
  await requireAdminRole(["ANALYST", "ADMIN", "SUPER_ADMIN"]);
  return <AdminMerchantFeedPageClient />;
}
