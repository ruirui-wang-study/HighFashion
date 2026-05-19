import type { ProductCategory } from "@/lib/types";

export const categorySlugs: Record<ProductCategory, string> = {
  Support: "support",
  Carry: "carry",
  Hydration: "hydration",
  Socks: "socks",
  Sweat: "sweat",
  Recovery: "recovery",
};

export function categoryToSlug(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function slugToCategory(slug: string) {
  const match = Object.entries(categorySlugs).find(([, value]) => value === slug);
  return match?.[0];
}
