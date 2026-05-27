import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";

type FeedField =
  | "title"
  | "description"
  | "link"
  | "image_link"
  | "price"
  | "availability"
  | "brand"
  | "condition"
  | "google_product_category";

type FeedItem = {
  id: string;
  title: string | null;
  description: string | null;
  link: string | null;
  image_link: string | null;
  price: string | null;
  availability: string | null;
  brand: string | null;
  condition: string | null;
  google_product_category: string | null;
  readiness: "ready" | "missing_fields";
  missingFields: FeedField[];
};

const merchantFeedInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: [{ priceCents: "asc" as const }] },
} satisfies Prisma.ProductInclude;

@Injectable()
export class AdminMerchantFeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService = new ConfigService(),
  ) {}

  async getFeedOverview() {
    const products = await this.prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: merchantFeedInclude,
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });

    const items = products.map((product) => mapProductToFeedItem(product, this.config));
    const readyProducts = items.filter((item) => item.readiness === "ready").length;

    return {
      connection: getMerchantConnectionStatus(this.config),
      summary: {
        totalProducts: items.length,
        readyProducts,
        productsWithIssues: items.length - readyProducts,
      },
      items,
    };
  }

  async exportFeed(format: "xml" | "json") {
    const overview = await this.getFeedOverview();
    const siteUrl = resolveSiteUrl(this.config, "");
    const content = format === "xml" ? toMerchantXml(overview.items, siteUrl) : JSON.stringify({ items: overview.items }, null, 2);

    return {
      format,
      mimeType: format === "xml" ? "application/xml" : "application/json",
      fileName: `pulsegear-merchant-feed.${format}`,
      content,
    };
  }
}

export function getMerchantConnectionStatus(config: ConfigService) {
  const connected = Boolean(
    config.get<string>("GOOGLE_MERCHANT_ACCOUNT_ID")
      && config.get<string>("GOOGLE_MERCHANT_CLIENT_EMAIL")
      && config.get<string>("GOOGLE_MERCHANT_PRIVATE_KEY"),
  );

  return {
    connected,
    status: connected ? "Connected" : "Not Connected",
  };
}

function mapProductToFeedItem(
  product: Prisma.ProductGetPayload<{ include: typeof merchantFeedInclude }>,
  config: ConfigService,
): FeedItem {
  const activeVariants = product.variants.filter((variant) => variant.active);
  const firstVariant = activeVariants[0];
  const imageLink = product.images[0]?.url ?? null;
  const title = product.title?.trim() || null;
  const description = product.description?.trim() || product.shortDescription?.trim() || null;
  const link = product.slug ? resolveSiteUrl(config, `/products/${product.slug}`) : null;
  const price = firstVariant?.priceCents ? `${(firstVariant.priceCents / 100).toFixed(2)} USD` : null;
  const availableStock = firstVariant ? Math.max(0, firstVariant.stock - firstVariant.reservedStock) : 0;
  const availability = firstVariant ? (availableStock > 0 ? "in stock" : "out of stock") : null;
  const brand = "PulseGear";
  const condition = "new";
  const googleProductCategory = categoryToGoogleCategory(product.category);

  const missingFields = ([
    ["title", title],
    ["description", description],
    ["link", link],
    ["image_link", imageLink],
    ["price", price],
    ["availability", availability],
    ["brand", brand],
    ["condition", condition],
    ["google_product_category", googleProductCategory],
  ] as const)
    .filter(([, value]) => !value)
    .map(([field]) => field);

  return {
    id: product.id,
    title,
    description,
    link,
    image_link: imageLink,
    price,
    availability,
    brand,
    condition,
    google_product_category: googleProductCategory,
    readiness: missingFields.length === 0 ? "ready" : "missing_fields",
    missingFields,
  };
}

function categoryToGoogleCategory(category: string) {
  const map: Record<string, string> = {
    Support: "Sporting Goods > Athletics > Athletic Protective Gear",
    Carry: "Luggage & Bags > Sports Bags",
    Hydration: "Sporting Goods > Athletics > Water Bottles",
    Socks: "Apparel & Accessories > Clothing > Underwear & Socks > Socks",
    Sweat: "Apparel & Accessories > Clothing Accessories > Sweatbands",
    Recovery: "Health & Beauty > Health Care > Supports & Braces",
  };

  return map[category] ?? null;
}

function resolveSiteUrl(config: ConfigService, pathname: string) {
  const configured = config.get<string>("NEXT_PUBLIC_SITE_URL")
    ?? config.get<string>("FRONTEND_URL")
    ?? "http://localhost:3000";
  const normalized = configured.endsWith("/") ? configured.slice(0, -1) : configured;
  return `${normalized}${pathname}`;
}

function toMerchantXml(items: FeedItem[], siteUrl: string) {
  const channelItems = items.map((item) => `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title ?? "")}</g:title>
      <g:description>${escapeXml(item.description ?? "")}</g:description>
      <g:link>${escapeXml(item.link ?? "")}</g:link>
      <g:image_link>${escapeXml(item.image_link ?? "")}</g:image_link>
      <g:price>${escapeXml(item.price ?? "")}</g:price>
      <g:availability>${escapeXml(item.availability ?? "")}</g:availability>
      <g:brand>${escapeXml(item.brand ?? "")}</g:brand>
      <g:condition>${escapeXml(item.condition ?? "")}</g:condition>
      <g:google_product_category>${escapeXml(item.google_product_category ?? "")}</g:google_product_category>
    </item>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>PulseGear Merchant Feed</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Preview feed for active PulseGear products.</description>
${channelItems}
  </channel>
</rss>`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
