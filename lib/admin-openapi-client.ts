import type { paths } from "./generated/admin-openapi";

/** Paths exported by `admin-domains.json` (product-research + seo-automation). */
export type AdminOpenApiPath = keyof paths;

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: { code: string; message: string } };
type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
}

export function buildAdminOpenApiUrl(
  path: AdminOpenApiPath,
  options?: {
    pathParams?: Record<string, string>;
    query?: Record<string, string | number | undefined>;
  },
): string {
  let url = String(path);
  if (options?.pathParams) {
    for (const [key, value] of Object.entries(options.pathParams)) {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    }
  }
  if (options?.query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    }
    const suffix = params.toString();
    if (suffix) {
      url = `${url}?${suffix}`;
    }
  }
  return url;
}

export type AdminOpenApiFetchOptions = RequestInit & {
  pathParams?: Record<string, string>;
  query?: Record<string, string | number | undefined>;
};

/**
 * Typed fetch for admin domain routes defined in `api/openapi/admin-domains.json`.
 * Response bodies use domain types from `lib/*-types.ts` until OpenAPI documents return schemas.
 */
export async function adminOpenApiFetch<T>(path: AdminOpenApiPath, init?: AdminOpenApiFetchOptions): Promise<T> {
  const { pathParams, query, ...requestInit } = init ?? {};
  const resolvedPath = buildAdminOpenApiUrl(path, { pathParams, query });
  const requestId = createRequestId();

  const response = await fetch(`${apiBaseUrl}${resolvedPath}`, {
    ...requestInit,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-id": requestId,
      ...(requestInit.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    const message = body.success ? "Admin API request failed" : body.error.message;
    throw new Error(message);
  }
  return body.data;
}
