import { unstable_cache } from "next/cache";
import { getPublicSiteCopySnapshot } from "./storefront-settings";

export const getSiteCopySnapshot = (locale: "en" | "zh" = "en") => unstable_cache(
  async () => getPublicSiteCopySnapshot(locale),
  ["site-copy-snapshot", locale],
  { revalidate: 300, tags: ["site-copy", `site-copy-${locale}`] },
)();
