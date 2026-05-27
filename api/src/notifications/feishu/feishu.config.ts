import { ConfigService } from "@nestjs/config";

const PLACEHOLDER_MARKERS = ["replace_me", "replace_with", "your_", "oc_replace_me", "cli_replace_me"];

export type FeishuConfig = {
  enabled: boolean;
  appId: string;
  appSecret: string;
  alertChatId: string;
  mockMode: boolean;
};

export function readFeishuConfig(config: ConfigService): FeishuConfig {
  const enabled = parseBoolean(config.get<string>("FEISHU_ALERT_ENABLED"), true);
  const appId = (config.get<string>("FEISHU_APP_ID") ?? "").trim();
  const appSecret = (config.get<string>("FEISHU_APP_SECRET") ?? "").trim();
  const alertChatId = (config.get<string>("FEISHU_ALERT_CHAT_ID") ?? "").trim();
  const mockMode = !isRealCredential(appId) || !isRealCredential(appSecret) || !isRealCredential(alertChatId);

  return {
    enabled,
    appId: appId || "cli_replace_me",
    appSecret: appSecret || "replace_me",
    alertChatId: alertChatId || "oc_replace_me",
    mockMode,
  };
}

export function isFeishuReady(config: FeishuConfig) {
  return config.enabled && !config.mockMode;
}

function isRealCredential(value: string) {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return !PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined || value.trim() === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}
