import { spawn } from "node:child_process";
import fs from "node:fs";
import { ensureLogsDir, getLogPath, resolveLogDir } from "./logging.mjs";
import { startNextDevLogLinker } from "./link-next-dev-logs.mjs";
import { migrateLogs } from "./migrate-logs.mjs";

const [, , logBasename, command, ...args] = process.argv;

if (!logBasename || !command) {
  console.error("Usage: node scripts/run-with-log.mjs <log-basename> <command> [args...]");
  process.exit(1);
}

ensureLogsDir();
migrateLogs();
const logFile = getLogPath(logBasename);
const logStream = fs.createWriteStream(logFile, { flags: "a" });
const stopNextLinker = logBasename === "next-dev" ? startNextDevLogLinker() : () => {};

const writeChunk = (chunk, target) => {
  target.write(chunk);
  logStream.write(chunk);
};

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    LOG_DIR: resolveLogDir(),
  },
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

child.stdout?.on("data", (chunk) => writeChunk(chunk, process.stdout));
child.stderr?.on("data", (chunk) => writeChunk(chunk, process.stderr));

child.on("close", (code) => {
  stopNextLinker();
  logStream.end();
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  stopNextLinker();
  logStream.end();
  console.error(error);
  process.exit(1);
});
