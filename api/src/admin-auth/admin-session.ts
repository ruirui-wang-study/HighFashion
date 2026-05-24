import { createHmac, timingSafeEqual } from "crypto";
import type { AdminRoleName } from "@prisma/client";

export const adminSessionCookieName = "pulsegear_admin_session";

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

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createAdminSessionToken(payload: AdminSessionPayload) {
  const body = encode(JSON.stringify(payload));
  const signature = sign(body);
  return `${body}.${signature}`;
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

export function parseCookie(cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";").map((part) => part.trim());
  const match = pairs.find((part) => part.startsWith(`${adminSessionCookieName}=`));
  return match ? decodeURIComponent(match.slice(adminSessionCookieName.length + 1)) : null;
}
