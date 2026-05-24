import type { AdminRoleName } from "./admin-session";

export type AdminNavItem = {
  href: string;
  label: string;
  roles: AdminRoleName[];
};

export function hasAdminRole(actual: AdminRoleName, allowed: AdminRoleName[]) {
  if (actual === "SUPER_ADMIN") return true;
  if (actual === "ADMIN") return !allowed.includes("SUPER_ADMIN");
  return allowed.includes(actual);
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", roles: ["VIEWER"] },
  { href: "/admin/products", label: "Products", roles: ["OPERATOR"] },
  { href: "/admin/orders", label: "Orders", roles: ["OPERATOR"] },
  { href: "/admin/inventory", label: "Inventory", roles: ["OPERATOR"] },
  { href: "/admin/content", label: "Content", roles: ["CONTENT_EDITOR"] },
  { href: "/admin/seo", label: "SEO", roles: ["CONTENT_EDITOR"] },
  { href: "/admin/analytics", label: "Analytics", roles: ["ANALYST"] },
  { href: "/admin/marketing/merchant-feed", label: "Marketing", roles: ["ANALYST"] },
  { href: "/admin/settings", label: "Settings", roles: ["ADMIN"] },
];

export function getAdminNavForRole(role: AdminRoleName) {
  return adminNavItems.filter((item) => hasAdminRole(role, item.roles));
}
