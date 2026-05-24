import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MerchantCenterSyncService {
  constructor(private readonly config: ConfigService) {}

  getConnectionStatus() {
    const connected = Boolean(
      this.config.get<string>("GOOGLE_MERCHANT_ACCOUNT_ID")
        && this.config.get<string>("GOOGLE_MERCHANT_CLIENT_EMAIL")
        && this.config.get<string>("GOOGLE_MERCHANT_PRIVATE_KEY"),
    );

    return {
      connected,
      status: connected ? "Connected" : "Not Connected",
    };
  }

  async uploadFeedPreview() {
    return {
      supported: false,
      status: "Not Implemented",
      message: "Google Merchant API upload is not enabled yet.",
      connection: this.getConnectionStatus(),
    };
  }
}
