import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  const env = {};
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function redact(value) {
  if (!value) return "(missing)";
  return `(set, length=${value.length})`;
}

function extractAnthropicText(payload) {
  const blocks = payload?.content;
  if (!Array.isArray(blocks)) return "";
  return blocks
    .filter((block) => block?.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n");
}

async function postJson(url, headers, body, timeoutMs = 60_000) {
  const started = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }
  return { response, payload, elapsedMs: Date.now() - started };
}

async function testAnthropicEndpoint({ label, baseUrl, apiKey, model }) {
  const root = baseUrl.replace(/\/+$/, "");
  const url = `${root}/v1/messages`;
  const body = {
    model,
    max_tokens: 128,
    system: "Reply with strict JSON only.",
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: '{"ok":true,"provider":"mimo","protocol":"anthropic"}' }],
      },
    ],
    stream: false,
    thinking: { type: "disabled" },
  };

  console.log(`\n=== ${label} ===`);
  console.log(`  POST ${url}`);
  console.log(`  model: ${model}`);

  const modes = [
    { name: "api-key", headers: { "Content-Type": "application/json", "api-key": apiKey } },
    { name: "Bearer", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` } },
  ];

  for (const mode of modes) {
    try {
      const { response, payload, elapsedMs } = await postJson(url, mode.headers, body);
      console.log(`  [${mode.name}] HTTP ${response.status} (${elapsedMs}ms)`);
      if (!response.ok) {
        console.log(`  error: ${typeof payload === "object" ? JSON.stringify(payload).slice(0, 400) : String(payload).slice(0, 400)}`);
        continue;
      }

      const text = extractAnthropicText(payload);
      const usage = payload?.usage;
      console.log("  OK");
      if (usage) {
        console.log(`  tokens: in=${usage.input_tokens ?? "?"} out=${usage.output_tokens ?? "?"}`);
      }
      console.log(`  reply: ${text.trim().slice(0, 200)}`);
      return true;
    } catch (error) {
      console.log(`  [${mode.name}] network error: ${error instanceof Error ? error.message : error}`);
    }
  }

  return false;
}

async function testOpenAiEndpoint({ label, baseUrl, apiKey, model }) {
  const root = baseUrl.replace(/\/+$/, "");
  const url = `${root}/chat/completions`;
  const body = {
    model,
    messages: [{ role: "user", content: '{"ok":true,"provider":"mimo","protocol":"openai"}' }],
    max_completion_tokens: 64,
    temperature: 0,
    thinking: { type: "disabled" },
  };

  console.log(`\n=== ${label} ===`);
  console.log(`  POST ${url}`);

  try {
    const { response, payload, elapsedMs } = await postJson(url, {
      "Content-Type": "application/json",
      "api-key": apiKey,
    }, body);
    console.log(`  HTTP ${response.status} (${elapsedMs}ms)`);
    if (!response.ok) {
      console.log(`  error: ${typeof payload === "object" ? JSON.stringify(payload).slice(0, 400) : String(payload).slice(0, 400)}`);
      return false;
    }
    const text = payload?.choices?.[0]?.message?.content ?? "";
    console.log(`  OK — reply: ${String(text).trim().slice(0, 200)}`);
    return true;
  } catch (error) {
    console.log(`  network error: ${error instanceof Error ? error.message : error}`);
    return false;
  }
}

async function main() {
  const envPath = resolve(import.meta.dirname, "../../.env");
  const env = loadEnvFile(envPath);
  const apiKey = env.MIMO_API_KEY;
  const model = env.MIMO_MODEL_CANDIDATE_GENERATION ?? "mimo-v2.5-pro";

  console.log("MiMo connectivity test");
  console.log(`  apiKey: ${redact(apiKey)}`);

  if (!apiKey) {
    console.error("\nFAIL: MIMO_API_KEY is not set in .env");
    process.exitCode = 1;
    return;
  }

  const tokenPlanAnthropic =
    env.MIMO_ANTHROPIC_BASE_URL ?? "https://token-plan-cn.xiaomimimo.com/anthropic";
  const officialAnthropic = "https://api.xiaomimimo.com/anthropic";
  const officialOpenAi = env.MIMO_BASE_URL ?? "https://api.xiaomimimo.com/v1";

  const tokenPlanOk = await testAnthropicEndpoint({
    label: "Token Plan CN (Anthropic)",
    baseUrl: tokenPlanAnthropic,
    apiKey,
    model,
  });
  const officialAnthropicOk = await testAnthropicEndpoint({
    label: "Official API (Anthropic)",
    baseUrl: officialAnthropic,
    apiKey,
    model,
  });
  const officialOpenAiOk = await testOpenAiEndpoint({
    label: "Official API (OpenAI compat)",
    baseUrl: officialOpenAi,
    apiKey,
    model,
  });
  const results = [tokenPlanOk, officialAnthropicOk, officialOpenAiOk];

  if (!results.some(Boolean)) {
    console.error("\nFAIL: no endpoint accepted the API key");
    process.exitCode = 1;
    return;
  }

  console.log("\nAt least one endpoint succeeded.");
}

void main();
