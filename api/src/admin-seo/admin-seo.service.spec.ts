import type { PrismaService } from "../common/prisma.service";
import { AdminSeoService } from "./admin-seo.service";

function createPrismaMock(products?: unknown[]) {
  return {
    product: {
      findMany: jest.fn().mockResolvedValue(products ?? []),
    },
  } as unknown as PrismaService;
}

describe("AdminSeoService", () => {
  it("returns mock Search Console overview metrics with a disconnected status", async () => {
    const prisma = createPrismaMock();
    const service = new AdminSeoService(prisma);

    const result = await service.getOverview(7);

    expect(result.searchConsole.connected).toBe(false);
    expect(result.searchConsole.status).toBe("Not Connected");
    expect(result.summary.organicClicks).toBeGreaterThan(0);
    expect(result.summary.impressions).toBeGreaterThan(result.summary.organicClicks);
    expect(result.topQueries.length).toBeGreaterThan(0);
    expect(result.topPages.length).toBeGreaterThan(0);
    expect(result.pagesLosingTraffic.length).toBeGreaterThan(0);
  });

  it("calculates page health score deductions for missing fields and returns page/query rows", async () => {
    const prisma = createPrismaMock([
      {
        id: "product_1",
        title: "PulseFlex Knee Sleeve",
        slug: "pulseflex-knee-sleeve",
        shortDescription: "Breathable compression support.",
        seoTitle: null,
        seoDescription: null,
        canonicalUrl: null,
        status: "ACTIVE",
        images: [
          { alt: "Front view" },
          { alt: "" },
        ],
      },
    ]);
    const service = new AdminSeoService(prisma);

    const pages = await service.getPages(7);
    const queries = await service.getQueries(7);

    expect(pages.rows[0]).toEqual(
      expect.objectContaining({
        url: "/products/pulseflex-knee-sleeve",
        indexStatus: "indexable",
        healthScore: 25,
      }),
    );
    expect(pages.rows[0].issues).toEqual([
      "missing title",
      "missing description",
      "missing canonical",
      "missing alt text",
    ]);
    expect(pages.rows.some((row) => row.url === "/about")).toBe(true);
    expect(pages.rows.some((row) => row.url === "/faq" && row.healthScore === 100)).toBe(true);

    expect(queries.searchConsole.status).toBe("Not Connected");
    expect(queries.rows[0]).toEqual(
      expect.objectContaining({
        query: expect.any(String),
        landingPage: expect.any(String),
        country: expect.any(String),
        device: expect.any(String),
      }),
    );
  });
});
