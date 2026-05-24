import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/components/cart-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { localeCookieName, normalizeLocale } from "@/lib/i18n";
import { getSiteCopySnapshot } from "@/lib/site-copy";
import { defaultDescription, getRuntimeSiteUrl, siteName } from "@/lib/seo";
import { getPublicStorefrontSettings } from "@/lib/storefront-settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const siteCopy = await getSiteCopySnapshot();
  return {
    metadataBase: new URL(await getRuntimeSiteUrl()),
    title: `${siteCopy.site.brandName || siteName} | Lightweight Support and Carry Essentials`,
    description: defaultDescription,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const pathname = headerStore.get("x-pulsegear-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");
  const storefrontSettings = isAdminRoute ? null : await getPublicStorefrontSettings();
  const siteCopy = isAdminRoute ? null : await getSiteCopySnapshot();
  const initialLocale = normalizeLocale(cookieStore.get(localeCookieName)?.value);

  return (
    <html lang={initialLocale === "zh" ? "zh-CN" : "en"}>
      <body>
        <LocaleProvider initialLocale={initialLocale}>
          {isAdminRoute ? (
            children
          ) : (
            <CartProvider>
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter
                brandName={siteCopy?.site.brandName}
                supportEmail={storefrontSettings?.supportEmail}
                returnsPolicyUrl={storefrontSettings?.returnsPolicyUrl}
                shippingCopy={siteCopy?.site.shippingCopy}
                returnsCopy={siteCopy?.site.returnsCopy}
              />
            </CartProvider>
          )}
        </LocaleProvider>
      </body>
    </html>
  );
}
