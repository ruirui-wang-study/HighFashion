import type { AdminRoleName } from "@prisma/client";

export function hasAdminRole(required: AdminRoleName[], actual?: AdminRoleName | null) {
  if (!actual) return false;
  if (required.length === 0) return true;
  if (actual === "SUPER_ADMIN") return true;
  if (actual === "ADMIN") return !required.includes("SUPER_ADMIN");
  return required.includes(actual);
}
