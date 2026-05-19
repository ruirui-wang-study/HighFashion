# PulseGear Storefront MVP

PulseGear is a mobile-first DTC storefront MVP for lightweight sports support and carry essentials. The visual direction is Performance Utility: graphite black, warm off-white, cool gray, electric lime accents, clean typography, high-contrast CTAs, and product-in-use placeholder imagery.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style primitives in `components/ui`
- lucide-react icons
- Local mock product and guide data
- LocalStorage cart state

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
```

## Project Structure

```text
app/                    Route files for Home, Collection, Product, Cart, About, Fit Guide, Guides, FAQ
components/             Reusable layout, product, cart, collection, and UI components
components/ui/          shadcn/ui-style Button, Badge, and Section primitives
data/products.ts        Mock product catalog with the required product model
data/guides.ts          Mock guide/blog content
lib/types.ts            Shared TypeScript types
lib/product-filters.ts  Product filtering and sorting utilities
lib/utils.ts            Shared UI and formatting helpers
```

## Implemented Pages

- `/` Home
- `/collection` Collection with filters, sorting, product cards, and mobile filter drawer
- `/product/[slug]` Product detail page with gallery placeholders, button-group color/size selection, trust badges, sticky mobile add-to-cart, fit guide, reviews, and related products
- `/cart` Cart page with quantity updates, free-shipping progress, add-on recommendations, disabled checkout mock state
- `/about` Brand page
- `/fit-guide` Fit and measurement guide
- `/guides` Guide listing
- `/guides/[slug]` Guide detail pages
- `/faq` FAQ / Shipping & Returns

## Mock Data

Products live in `data/products.ts` and include:

- `id`
- `title`
- `slug`
- `category`
- `price`
- `compareAtPrice`
- `rating`
- `reviewCount`
- `shortDescription`
- `benefits`
- `features`
- `useCases`
- `colors`
- `sizes`
- `images`
- `badge`
- `bundleEligible`
- `inventoryStatus`

## Backend Integration Notes

### Shopify Storefront API

Replace `data/products.ts` with a product adapter in `lib/shopify.ts`. Keep the existing `Product` type as the UI boundary and map Shopify products, variants, media, prices, metafields, and inventory into that shape. Collection filters can later use Shopify product types, tags, options, and metafields.

### Stripe Checkout

The cart state is centralized in `components/cart-provider.tsx`. Replace the disabled checkout button in `components/cart-drawer.tsx` and `app/cart/page.tsx` with a server action or route handler that creates a Stripe Checkout Session from cart line items.

### CMS

Move `data/guides.ts` into a CMS adapter for Sanity, Contentful, Shopify metaobjects, or MDX. The `Guide` type in `lib/types.ts` is the stable interface used by the UI.

### Reviews / UGC

The product page review blocks are placeholders. Connect them to a reviews service later and replace the placeholder image blocks with customer-uploaded media.

## Notes

- Checkout is intentionally disabled in this MVP.
- Product imagery is represented by branded placeholder blocks to avoid copyrighted assets.
- The site is mobile-first and uses button groups for size selection instead of dropdowns.
