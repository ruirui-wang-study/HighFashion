import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FeishuConfig, isFeishuReady, readFeishuConfig } from "./feishu.config";

type FeishuApiResponse = {
  code: number;
  msg: string;
  tenant_access_token?: string;
  expire?: number;
  data?: {
    message_id?: string;
  };
};

type TokenCache = {
  token: string;
  expiresAt: number;
};

@Injectable()
export class FeishuClient {
  private readonly logger = new Logger(FeishuClient.name);
  private readonly config: FeishuConfig;
  private tokenCache: TokenCache | null = null;

  constructor(configService: ConfigService) {
    this.config = readFeishuConfig(configService);
  }

  getConfig() {
    return this.config;
  }

  async sendTextMessage(text: string) {
    if (!this.config.enabled) {
      this.logger.debug("Feishu alerts disabled; skipped message send");
      return { delivered: false, mode: "disabled" as const };
    }

    if (!isFeishuReady(this.config)) {
      this.logger.warn(
        JSON.stringify({
          event: "feishu.mock_send",
          reason: "placeholder_credentials",
          appId: maskSecret(this.config.appId),
          alertChatId: maskSecret(this.config.alertChatId),
          preview: text.slice(0, 500),
        }),
      );
      return { delivered: false, mode: "mock" as const };
    }

    const token = await this.getTenantAccessToken();
    const response = await fetch(
      `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receive_id: this.config.alertChatId,
          msg_type: "text",
          content: JSON.stringify({ text }),
        }),
      },
    );

    const payload = (await response.json()) as FeishuApiResponse;
    if (!response.ok || payload.code !== 0) {
      throw new Error(`Feishu send failed: ${payload.msg || response.statusText}`);
    }

    return { delivered: true, mode: "live" as const, messageId: payload.data?.message_id ?? null };
  }

  private async getTenantAccessToken() {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 60_000) {
      return this.tokenCache.token;
    }

    const response = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: this.config.appId,
        app_secret: this.config.appSecret,
      }),
    });

    const payload = (await response.json()) as FeishuApiResponse;
    if (!response.ok || payload.code !== 0 || !payload.tenant_access_token) {
      throw new Error(`Feishu auth failed: ${payload.msg || response.statusText}`);
    }

    const expiresInSeconds = payload.expire ?? 7200;
    this.tokenCache = {
      token: payload.tenant_access_token,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    };
    return this.tokenCache.token;
  }
}

function maskSecret(value: string) {
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}
