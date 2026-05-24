import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const keyLength = 64;

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, keyLength).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyAdminPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, keyLength);
  const original = Buffer.from(hash, "hex");
  return original.length === derived.length && timingSafeEqual(original, derived);
}
