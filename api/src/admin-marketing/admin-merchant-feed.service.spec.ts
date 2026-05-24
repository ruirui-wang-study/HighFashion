import type { PrismaService } from "../common/prisma.service";
import { AdminMerchantFeedService } from "./admin-merchant-feed.service";

function createPrismaMock(products: unknown[] = []) {
  return {
    product: {
      findMany: jest.fn().mockResolvedValue(products),
    },
  } as unknown as PrismaService;
}

describe("AdminMerchantFeedService", () => {
  it("builds readiness state and marks missing fields for active products", async () => {
    const prisma = createPrismaMock([
      {
        id: "product_1",
        title: "PulseFlex Knee Sleeve",
        slug: "pulseflex-knee-sleeve",
        category: "Support",
        description: "Breathable compression sleeve",
        shortDescription: "Breathable compression sleeve",
        status: "ACTIVE",
        images: [{ url: "https://cdn.example.com/knee.jpg", alt: "Knee sleeve" }],
        variants: [{ priceCents: 3400, stock: 4, active: true }],
      },
      {
        id: "product_2",
        title: "",
        slug: "broken-product",
        category: "Unknown",
        description: "",
        shortDescription: "",
        status: "ACTIVE",
        images: [],
        variants: [],
      },
    ]);

    const service = new AdminMerchantFeedService(prisma);
    const result = await service.getFeedOverview();

    expect(result.connection.connected).toBe(false);
    expect(result.connection.status).toBe("Not Connected");
    expect(result.summary.totalProducts).toBe(2);
    expect(result.summary.readyProducts).toBe(1);
    expect(result.items[0].missingFields).toEqual([]);
    expect(result.items[1].missingFields).toEqual(
      expect.arrayContaining([
        "title",
        "description",
        "image_link",
        "price",
        "availability",
        "google_product_category",
      ]),
    );
  });

  it("exports the feed as JSON and XML", async () => {
    const prisma = createPrismaMock([
      {
        id: "product_1",
        title: "PulseFlex Knee Sleeve",
        slug: "pulseflex-knee-sleeve",
        category: "Support",
        description: "Breathable compression sleeve",
        shortDescription: "Breathable compression sleeve",
        status: "ACTIVE",
        images: [{ url: "https://cdn.example.com/knee.jpg", alt: "Knee sleeve" }],
        variants: [{ priceCents: 3400, stock: 4, active: true }],
      },
    ]);

    const service = new AdminMerchantFeedService(prisma);
    const jsonExport = await service.exportFeed("json");
    const xmlExport = await service.exportFeed("xml");

    expect(jsonExport.mimeType).toBe("application/json");
    expect(jsonExport.fileName).toBe("pulsegear-merchant-feed.json");
    expect(jsonExport.content).toContain("pulseflex-knee-sleeve");

    expect(xmlExport.mimeType).toBe("application/xml");
    expect(xmlExport.fileName).toBe("pulsegear-merchant-feed.xml");
    expect(xmlExport.content).toContain("<g:id>product_1</g:id>");
    expect(xmlExport.content).toContain("<g:title>PulseFlex Knee Sleeve</g:title>");
  });
});
