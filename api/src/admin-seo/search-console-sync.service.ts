import { Injectable } from "@nestjs/common";
import { SearchConsoleMockProvider } from "./search-console-mock.provider";

@Injectable()
export class SearchConsoleSyncService {
  private readonly provider = new SearchConsoleMockProvider();

  getConnectionStatus() {
    return {
      connected: this.provider.isConfigured(),
      status: this.provider.isConfigured() ? ("Connected" as const) : ("Not Connected" as const),
    };
  }

  async sync() {
    return {
      ...this.getConnectionStatus(),
      syncedAt: null as string | null,
      mode: "mock_fallback" as const,
    };
  }

  getProvider() {
    return this.provider;
  }
}
