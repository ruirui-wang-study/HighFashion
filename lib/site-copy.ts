import { unstable_cache } from "next/cache";
import { getPublicSiteCopySnapshot } from "./storefront-settings";

export const getSiteCopySnapshot = unstable_cache(
  async () => getPublicSiteCopySnapshot(),
  ["site-copy-snapshot"],
  { revalidate: 300, tags: ["site-copy"] },
);
