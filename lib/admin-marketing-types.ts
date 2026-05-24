export type AdminMerchantConnection = {
  connected: boolean;
  status: "Connected" | "Not Connected";
};

export type AdminMerchantFeedField =
  | "title"
  | "description"
  | "link"
  | "image_link"
  | "price"
  | "availability"
  | "brand"
  | "condition"
  | "google_product_category";

export type AdminMerchantFeedItem = {
  id: string;
  title: string | null;
  description: string | null;
  link: string | null;
  image_link: string | null;
  price: string | null;
  availability: string | null;
  brand: string | null;
  condition: string | null;
  google_product_category: string | null;
  readiness: "ready" | "missing_fields";
  missingFields: AdminMerchantFeedField[];
};

export type AdminMerchantFeedOverview = {
  connection: AdminMerchantConnection;
  summary: {
    totalProducts: number;
    readyProducts: number;
    productsWithIssues: number;
  };
  items: AdminMerchantFeedItem[];
};

export type AdminMerchantFeedExport = {
  format: "xml" | "json";
  mimeType: string;
  fileName: string;
  content: string;
};
