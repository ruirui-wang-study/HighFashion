import type { AdminRoleName } from "./admin-session";

export type AdminRole = AdminRoleName;

export type AdminInventoryLevel = "in_stock" | "low_stock" | "out_of_stock";
export type AdminProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type AdminProductImage = {
  id?: string;
  url: string;
  alt: string;
  sortOrder: number;
};

export type AdminProductVariant = {
  id?: string;
  sku: string;
  color: string;
  size: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  stock: number;
  lowStockThreshold: number;
  weightGrams?: number | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  inventoryLevel?: AdminInventoryLevel;
};

export type AdminProduct = {
  id: string;
  title: string;
  titleEn?: string | null;
  titleZh?: string | null;
  slug: string;
  category: string;
  shortDescription: string;
  shortDescriptionEn?: string | null;
  shortDescriptionZh?: string | null;
  description: string;
  descriptionEn?: string | null;
  descriptionZh?: string | null;
  seoTitle?: string | null;
  seoTitleEn?: string | null;
  seoTitleZh?: string | null;
  seoDescription?: string | null;
  seoDescriptionEn?: string | null;
  seoDescriptionZh?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  status: AdminProductStatus;
  badge?: string | null;
  rating: number;
  reviewCount: number;
  benefits: string[];
  benefitsEn: string[];
  benefitsZh: string[];
  features: string[];
  featuresEn: string[];
  featuresZh: string[];
  useCases: string[];
  bundleEligible: boolean;
  createdAt: string;
  updatedAt: string;
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  inventorySummary: {
    totalStock: number;
    lowStockVariants: number;
    outOfStockVariants: number;
  };
};

export type AdminInventoryItem = {
  id: string;
  sku: string;
  color: string;
  size: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  stock: number;
  lowStockThreshold: number;
  weightGrams?: number | null;
  active: boolean;
  inventoryLevel: AdminInventoryLevel;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    slug: string;
    category: string;
    status: AdminProductStatus;
  };
};

export type AdminProductPayload = {
  title: string;
  titleEn?: string | null;
  titleZh?: string | null;
  slug: string;
  category: string;
  shortDescription: string;
  shortDescriptionEn?: string | null;
  shortDescriptionZh?: string | null;
  description: string;
  descriptionEn?: string | null;
  descriptionZh?: string | null;
  seoTitle?: string | null;
  seoTitleEn?: string | null;
  seoTitleZh?: string | null;
  seoDescription?: string | null;
  seoDescriptionEn?: string | null;
  seoDescriptionZh?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  badge?: string | null;
  benefits: string[];
  benefitsEn: string[];
  benefitsZh: string[];
  features: string[];
  featuresEn: string[];
  featuresZh: string[];
  useCases: string[];
  bundleEligible: boolean;
  status: AdminProductStatus;
  images: AdminProductImage[];
  variants: AdminProductVariant[];
};
