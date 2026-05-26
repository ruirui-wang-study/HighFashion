import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ensureLogsDir, REPO_ROOT, resolveLogDir } from "./logging.mjs";

const nextDevLogsDir = path.join(REPO_ROOT, ".next", "dev", "logs");
const linkPath = path.join(resolveLogDir(), "next");

function removeExistingLink() {
  if (!fs.existsSync(linkPath)) {
    return;
  }

  const stat = fs.lstatSync(linkPath);
  if (stat.isSymbolicLink() || stat.isDirectory()) {
    fs.rmSync(linkPath, { recursive: true, force: true });
  }
}

export function linkNextDevLogs() {
  if (!fs.existsSync(nextDevLogsDir)) {
    return false;
  }

  ensureLogsDir();
  removeExistingLink();

  const target = path.resolve(nextDevLogsDir);
  const type = process.platform === "win32" ? "junction" : "dir";

  fs.symlinkSync(target, linkPath, type);
  return true;
}

export function startNextDevLogLinker(pollMs = 1500) {
  if (linkNextDevLogs()) {
    return () => {};
  }

  const timer = setInterval(() => {
    if (linkNextDevLogs()) {
      clearInterval(timer);
    }
  }, pollMs);

  return () => clearInterval(timer);
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) {
  const linked = linkNextDevLogs();
  if (!linked) {
    console.error(`Next dev logs not found at ${nextDevLogsDir}. Start "npm run dev" first.`);
    process.exit(1);
  }
  console.log(`Linked ${linkPath} -> ${nextDevLogsDir}`);
}
