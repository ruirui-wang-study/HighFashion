import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureLogsDir, REPO_ROOT, resolveLogDir } from "./logging.mjs";

const LOG_DIR = resolveLogDir();

const SOURCE_ROOTS = [
  { dir: REPO_ROOT, prefix: "" },
  { dir: path.join(REPO_ROOT, "api"), prefix: "api-" },
];

function listLogFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isFile()) {
      return [];
    }
    const name = entry.name;
    if (!name.endsWith(".log") && !name.includes(".log.")) {
      return [];
    }
    return [path.join(dir, name)];
  });
}

function destinationName(sourcePath, prefix) {
  const base = path.basename(sourcePath);
  const normalized = base.startsWith(".") ? base.slice(1) : base;
  return `${prefix}${normalized}`;
}

function uniqueDestination(destPath) {
  if (!fs.existsSync(destPath)) {
    return destPath;
  }

  const dir = path.dirname(destPath);
  const ext = path.extname(destPath);
  const stem = path.basename(destPath, ext);
  let index = 1;

  while (fs.existsSync(destPath)) {
    destPath = path.join(dir, `${stem}-${index}${ext}`);
    index += 1;
  }

  return destPath;
}

function moveLogFile(from) {
  const relative = path.relative(REPO_ROOT, from);
  const prefix = relative.startsWith(`api${path.sep}`) ? "api-" : "";
  const dest = uniqueDestination(path.join(LOG_DIR, destinationName(from, prefix)));

  fs.renameSync(from, dest);
  return { from: relative, to: path.relative(REPO_ROOT, dest) };
}

function copyNextDevelopmentLog() {
  const source = path.join(REPO_ROOT, ".next", "dev", "logs", "next-development.log");
  if (!fs.existsSync(source)) {
    return null;
  }

  const dest = path.join(LOG_DIR, "next-development.log");
  if (fs.existsSync(dest)) {
    const stat = fs.statSync(dest);
    const sourceStat = fs.statSync(source);
    if (stat.mtimeMs >= sourceStat.mtimeMs) {
      return null;
    }
  }

  fs.copyFileSync(source, dest);
  return { from: ".next/dev/logs/next-development.log", to: path.relative(REPO_ROOT, dest), copied: true };
}

export function migrateLogs() {
  ensureLogsDir();

  const moved = [];
  const seen = new Set();

  for (const { dir, prefix } of SOURCE_ROOTS) {
    for (const file of listLogFiles(dir)) {
      if (seen.has(file)) {
        continue;
      }
      seen.add(file);

      const dest = path.join(LOG_DIR, destinationName(file, prefix));
      if (path.resolve(file) === path.resolve(dest)) {
        continue;
      }

      moved.push(moveLogFile(file));
    }
  }

  const copied = copyNextDevelopmentLog();
  if (copied) {
    moved.push(copied);
  }

  return moved;
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url);

if (isCli) {
  const results = migrateLogs();
  if (results.length === 0) {
    console.log("No stray log files to migrate.");
  } else {
    for (const entry of results) {
      const action = entry.copied ? "copied" : "moved";
      console.log(`${action}: ${entry.from} -> ${entry.to}`);
    }
  }
}
