import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(scriptsDir, "..");

export function resolveLogDir() {
  const configured = process.env.LOG_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.resolve(REPO_ROOT, configured);
  }
  return path.join(REPO_ROOT, "logs");
}

export function ensureLogsDir() {
  fs.mkdirSync(resolveLogDir(), { recursive: true });
}

export function getLogPath(basename) {
  const suffix = basename.endsWith(".log") ? "" : ".log";
  return path.join(resolveLogDir(), `${basename}${suffix}`);
}
