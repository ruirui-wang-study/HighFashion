import { getRuntimeSiteUrl } from "@/lib/seo";

export async function GET() {
  const siteUrl = await getRuntimeSiteUrl();
  const body = [
    "PulseGear",
    "",
    "PulseGear is a DTC sports accessories brand focused on lightweight support, carry, hydration, and sweat-control gear for running, training, and court sports.",
    "",
    "Core Categories:",
    "- Support",
    "- Carry",
    "- Hydration",
    "- Socks",
    "- Sweat",
    "- Recovery",
    "",
    "Key Guides:",
    `- ${siteUrl}/guides`,
    "",
    "Important URLs:",
    `- Sitemap: ${siteUrl}/sitemap.xml`,
    `- FAQ: ${siteUrl}/faq`,
    `- About: ${siteUrl}/about`,
    `- Shipping & Returns: ${siteUrl}/pages/shipping-returns-warranty`,
    `- Brand: ${siteUrl}/pages/brand`,
    `- Materials & Fit: ${siteUrl}/pages/materials-and-fit-guide`,
    "",
    "Contact:",
    "- support@pulsegear.local",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
