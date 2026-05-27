import { ConfigService } from "@nestjs/config";
import { isFeishuReady, readFeishuConfig } from "./feishu.config";

describe("feishu.config", () => {
  it("uses mock mode when credentials are placeholders", () => {
    const config = new ConfigService({
      FEISHU_APP_ID: "cli_replace_me",
      FEISHU_APP_SECRET: "replace_me",
      FEISHU_ALERT_CHAT_ID: "oc_replace_me",
    });

    const feishu = readFeishuConfig(config);
    expect(feishu.mockMode).toBe(true);
    expect(isFeishuReady(feishu)).toBe(false);
  });

  it("enables live mode when real credentials are provided", () => {
    const config = new ConfigService({
      FEISHU_APP_ID: "cli_a1b2c3d4",
      FEISHU_APP_SECRET: "s3cr3tvalue",
      FEISHU_ALERT_CHAT_ID: "oc_1234567890",
    });

    const feishu = readFeishuConfig(config);
    expect(feishu.mockMode).toBe(false);
    expect(isFeishuReady(feishu)).toBe(true);
  });
});
