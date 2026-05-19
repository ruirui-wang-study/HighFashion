import type { Order, Product } from "@/lib/types";

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:4000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? "no-store",
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    const message = body.success ? "API request failed" : body.error.message;
    throw new Error(message);
  }
  return body.data;
}

export type ProductQuery = {
  category?: string;
  useCase?: string;
  size?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
};

export async function getProducts(query: ProductQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const suffix = params.toString() ? `?${params}` : "";
  return apiFetch<Product[]>(`/api/products${suffix}`);
}

export async function getProduct(slug: string) {
  return apiFetch<Product>(`/api/products/${slug}`);
}

export async function createCheckoutSession(input: { items: Array<{ variantId: string; quantity: number }>; email?: string; country?: string; currency?: string }) {
  return apiFetch<{ checkoutUrl: string; sessionId: string; orderNo: string }>("/api/checkout/session", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOrderBySession(sessionId: string) {
  return apiFetch<Order>(`/api/orders/by-session/${sessionId}`);
}
