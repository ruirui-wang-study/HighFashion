import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const committedPath = join(repoRoot, "api", "openapi", "admin-domains.json");

function hashFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

const tempDir = mkdtempSync(join(tmpdir(), "openapi-drift-"));
const generatedPath = join(tempDir, "admin-domains.json");

try {
  execSync("npm --prefix api run openapi:generate", {
    cwd: repoRoot,
    stdio: "inherit",
    env: { ...process.env, OPENAPI_OUTPUT_PATH: generatedPath },
  });

  const committed = hashFile(committedPath);
  const generated = hashFile(generatedPath);

  if (committed !== generated) {
    // eslint-disable-next-line no-console
    console.error(
      "OpenAPI drift detected: api/openapi/admin-domains.json is out of date.\nRun: npm run openapi:generate",
    );
    process.exitCode = 1;
  } else {
    // eslint-disable-next-line no-console
    console.log("OpenAPI contract is up to date.");
  }
} catch {
  process.exitCode = 1;
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
