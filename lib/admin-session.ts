import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { adminSessionCookieName } from "./admin-constants";

export type AdminRoleName =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "OPERATOR"
  | "CONTENT_EDITOR"
  | "ANALYST"
  | "VIEWER";

export type AdminSessionPayload = {
  sub: string;
  role: AdminRoleName;
  email: string;
  name: string;
  exp: number;
};

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "pulsegear-admin-dev-secret";
}

function sign(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const actual = Buffer.from(signature);
  const computed = Buffer.from(expected);
  if (actual.length !== computed.length || !timingSafeEqual(actual, computed)) return null;

  try {
    const payload = JSON.parse(decode(body)) as AdminSessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(adminSessionCookieName)?.value);
}
