export type ProductCategory = "Support" | "Carry" | "Hydration" | "Socks" | "Sweat" | "Recovery";
export type UseCase = "Run" | "Train" | "Court" | "Recovery";
export type InventoryStatus = "In stock" | "Low stock" | "Out of stock" | "Preorder";

export type ProductVariant = {
  id: string;
  sku: string;
  color: string;
  size: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  stock: number;
  active: boolean;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory | string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  description?: string;
  benefits: string[];
  features: string[];
  useCases: string[];
  colors: string[];
  sizes: string[];
  images: string[];
  badge?: string | null;
  bundleEligible: boolean;
  inventoryStatus: InventoryStatus;
  variants: ProductVariant[];
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
  variantId: string;
  productId: string;
  title: string;
  slug: string;
  unitPriceCents: number;
  color: string;
  size: string;
  quantity: number;
};

export type Order = {
  id: string;
  orderNo: string;
  email?: string | null;
  status: "PENDING" | "PAID" | "PAYMENT_FAILED" | "EXPIRED" | "FULFILLED" | "CANCELED" | "REFUNDED";
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  stripeCheckoutSessionId?: string | null;
  paymentMethodType?: string | null;
  items: Array<{
    id: string;
    titleSnapshot: string;
    skuSnapshot: string;
    colorSnapshot: string;
    sizeSnapshot: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }>;
};
