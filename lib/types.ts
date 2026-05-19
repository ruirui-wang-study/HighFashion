export type ProductCategory = "Support" | "Carry" | "Hydration" | "Socks" | "Sweat" | "Recovery";
export type UseCase = "Run" | "Train" | "Court" | "Recovery";
export type InventoryStatus = "In stock" | "Low stock" | "Preorder";

export type Product = {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  benefits: string[];
  features: string[];
  useCases: UseCase[];
  colors: string[];
  sizes: string[];
  images: string[];
  badge: string;
  bundleEligible: boolean;
  inventoryStatus: InventoryStatus;
};

export type Guide = {
  slug: string;
  title: string;
  dek: string;
  readTime: string;
  category: "Support" | "Run" | "Court";
  sections: { heading: string; body: string }[];
};

export type CartItem = {
  productId: string;
  title: string;
  slug: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
};
