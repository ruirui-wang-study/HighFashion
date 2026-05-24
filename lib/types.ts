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
  lowStockThreshold?: number;
  weightGrams?: number | null;
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
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
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

export type GuideSection = {
  heading: string;
  body: string;
};

export type GuideFaqItem = {
  question: string;
  answer: string;
};

export type GuideCollectionLink = {
  title: string;
  path: string;
};

export type GuideAuthor = {
  name: string;
  role: string;
};

export type Guide = {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  dek: string;
  publishedAt: string;
  updatedAt: string;
  author: GuideAuthor;
  category: string;
  readTime: string;
  sections: GuideSection[];
  faq: GuideFaqItem[];
  relatedProducts: string[];
  relatedCollections: GuideCollectionLink[];
  relatedGuides: string[];
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

export type OrderAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type OrderShippingDetails = {
  name?: string | null;
  address?: OrderAddress | null;
};

export type OrderBillingDetails = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: OrderAddress | null;
};

export type Order = {
  id: string;
  orderNo: string;
  email?: string | null;
  status: "PENDING" | "PAID" | "PAYMENT_FAILED" | "EXPIRED" | "FULFILLED" | "CANCELED" | "REFUNDED";
  createdAt?: string | null;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  fulfillmentStatus: "UNFULFILLED" | "FULFILLED";
  fulfilledAt?: string | null;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentMethodType?: string | null;
  customerCountry?: string | null;
  shippingAddress?: OrderShippingDetails | null;
  billingAddress?: OrderBillingDetails | null;
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
  notes?: Array<{
    id: string;
    note: string;
    createdAt: string;
    createdByAdmin: {
      id: string;
      name: string;
      email: string;
    } | null;
  }>;
  statusEvents?: Array<{
    id: string;
    type: string;
    fromValue: string | null;
    toValue: string | null;
    details: unknown;
    createdAt: string;
    createdByAdmin: {
      id: string;
      name: string;
      email: string;
    } | null;
  }>;
};
