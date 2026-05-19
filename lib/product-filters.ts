import type { Product } from "@/lib/types";

export type ProductSort = "best" | "newest" | "price-asc" | "price-desc";

export type ProductFilters = {
  category?: string;
  useCase?: string;
  size?: string;
  color?: string;
  maxPrice?: number;
};

export function filterProducts(products: Product[], filters: ProductFilters) {
  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.useCase && !product.useCases.includes(filters.useCase as never)) return false;
    if (filters.size && !product.sizes.includes(filters.size)) return false;
    if (filters.color && !product.colors.includes(filters.color)) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: ProductSort) {
  return [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "newest") return b.id.localeCompare(a.id);
    return b.reviewCount * b.rating - a.reviewCount * a.rating;
  });
}
