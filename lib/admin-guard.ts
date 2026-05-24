import { redirect } from "next/navigation";
import { getAdminSession, type AdminRoleName } from "./admin-session";
import { hasAdminRole } from "./admin-rbac";

export async function requireAdminRole(allowed: AdminRoleName[]) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!hasAdminRole(session.role, allowed)) redirect("/admin/dashboard");
  return session;
}
