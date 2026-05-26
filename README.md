# PulseGear Storefront + API

PulseGear is a mobile-first DTC ecommerce project for lightweight support, carry, hydration, sweat-control, and recovery gear. The repo contains a Next.js storefront and a NestJS API backed by PostgreSQL, Prisma, and Stripe Checkout.

## Architecture

```text
app/                         Next.js App Router pages and metadata routes
components/                  Reusable storefront UI, cart state, SEO helpers
data/                        Local content and SEO seed data
lib/                         Shared frontend utilities, types, SEO builders
api/                         NestJS API service
api/prisma/                  Prisma schema, migrations, seed script
```

### Frontend

- Framework: Next.js App Router + TypeScript + Tailwind CSS
- Main commerce routes:
  - `/`
  - `/shop`
  - `/products/[slug]`
  - `/collections/[...segments]`
  - `/cart`
  - `/checkout/success`
  - `/guides`
  - `/guides/[slug]`
  - `/faq`
  - `/fit-guide`
  - `/about`
- Main admin routes:
  - `/admin/login`
  - `/admin/dashboard`
  - `/admin/products`
  - `/admin/orders`
  - `/admin/inventory`
  - `/admin/content`
  - `/admin/seo`
  - `/admin/product-research/dashboard`
  - `/admin/product-research/candidates`
  - `/admin/product-research/import`
  - `/admin/product-research/suppliers`
  - `/admin/product-research/scoring-rules`
  - `/admin/product-research/risk-review`
  - `/admin/product-research/test-launches`
  - `/admin/product-research/decisions`
  - `/admin/analytics`
  - `/admin/marketing/merchant-feed`
  - `/admin/settings`
- Shared client state:
  - cart state in `components/cart-provider.tsx`
  - API access through `lib/api-client.ts`
- SEO surface:
  - `app/sitemap.ts`
  - `app/robots.ts`
  - `lib/seo.ts`
  - `lib/structured-data.ts`

### Backend

- Framework: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Payments: Stripe Checkout + webhook fulfillment
- API modules:
  - `health`
  - `products`
  - `collections`
  - `checkout`
  - `orders`
  - `payments`
  - `webhooks`
  - `admin-auth`
  - `admin-products`
  - `admin-orders`
  - `admin-content`
  - `admin-seo`
  - `product-research`
  - `seo-automation`
  - `admin-analytics`
  - `admin-marketing`
  - `admin-settings`

## Project Status

Current repo status as of `2026-05-26`:

- Storefront and admin MVP are running end-to-end:
  - browsing
  - cart
  - Stripe Checkout
  - order lookup
  - admin product, inventory, order, content, SEO, analytics, and settings surfaces
- Product Research is now beyond route-shell stage:
  - persistent candidates
  - AI / CSV / supplier quote / Alibaba link import flows
  - scoring
  - risk flags
  - test launches
  - decisions
  - convert-to-product draft safety rules
- SEO automation is now AI-assisted rather than template-only:
  - recommendations
  - internal links
  - opportunities
  - content brief title and outline
  - product SEO drafts
- Shared AI configuration has been unified under `ai.*` settings with backward compatibility for older `product_research.ai.*` keys
- Product Research and SEO automation have both been structurally split into domain services instead of continuing to grow as single oversized services
- Public content and product copy now support separated `en` and `zh` storage with admin editing for:
  - products
  - FAQ
  - guides
  - collection landings
  - about
  - fit guide
  - home page copy blocks

Current maturity by area:

- Commerce core: stable MVP
- Admin operations: stable MVP
- Product Research: usable internal alpha
- SEO automation: usable internal alpha with AI-assisted draft generation
- External data integrations: partial, still using fallback or mock-safe behavior where credentials or providers are not yet fully wired

## Current Features

### Storefront

- Product listing, collection browsing, and product detail pages
- Variant-aware cart using `variantId`
- Sticky mobile add-to-cart and trust/shipping support content on product pages
- Stripe Checkout session creation from API
- Order creation before redirect to Stripe
- Checkout success page polling order state by Stripe session ID
- Public order lookup by order number and by checkout session ID
- Webhook-driven order updates:
  - `PENDING`
  - `PAID`
  - `PAYMENT_FAILED`
  - `EXPIRED`
- Payment status history returned in storefront order responses
- Inventory deduction on successful payment
- Cart reconciliation that removes stale or unavailable variants before checkout
- Scenario-based navigation for `Run`, `Train`, `Court`, and `Recover`
- Public settings and copy snapshot endpoints used by the storefront

### Content and Guides

- Guides index page at `/guides`
- Guide detail pages at `/guides/[slug]`
- Local guide content system in `data/guides.ts`
- Each guide includes:
  - title
  - slug
  - metaTitle
  - metaDescription
  - publishedAt
  - updatedAt
  - author
  - category
  - FAQ
  - relatedProducts
  - relatedCollections
  - relatedGuides
- Guide pages render:
  - metadata
  - Article JSON-LD
  - table of contents
  - FAQ block
  - related products
  - related guides
  - related collection links

### Collection SEO System

- Canonical collection route handled through `app/collections/[...segments]/page.tsx`
- Indexable base category pages:
  - `/collections/support`
  - `/collections/carry`
  - `/collections/hydration`
  - `/collections/socks`
  - `/collections/sweat`
  - `/collections/recovery`
- Indexable SEO landing page whitelist:
  - `/collections/running/knee-support`
  - `/collections/running/hydration-belts`
  - `/collections/court/pickleball-accessories`
  - `/collections/training/compression-gear`
- Query-parameter filter pages with `sort`, `price`, `size`, or `color` default to `noindex, follow`
- Filtered collection pages canonicalize back to the base category page or the whitelisted landing page
- Base and whitelist pages include:
  - unique intro content
  - related guides
  - related products

### Admin and Operations

- Cookie-based admin login and logout
- Role-aware admin navigation for:
  - `VIEWER`
  - `OPERATOR`
  - `CONTENT_EDITOR`
  - `ANALYST`
  - `ADMIN`
  - `SUPER_ADMIN`
- Admin dashboard with KPI summary panels
- Product operations:
  - product list
  - product detail
  - create product
  - update product
- Inventory operations:
  - inventory list
  - manual stock adjustments
  - inventory movement persistence
- Order operations:
  - searchable order list
  - payment and fulfillment filters
  - order detail with Stripe IDs, notes, addresses, items, and status events
  - internal order notes
  - mark order fulfilled
- Content operations:
  - guide list by status
  - guide create and edit
  - publish, archive, and move guide back to draft
  - FAQ editing
  - bilingual content editing for:
    - products
    - FAQ
    - guides
    - collection landings
    - static pages
    - home page copy blocks
- SEO reporting:
  - SEO overview
  - page-level SEO performance view
  - query-level SEO performance view
- SEO automation:
  - automation overview
  - manual health check run
  - issue review and bulk review
  - manual GSC sync
  - manual GA4 sync
  - opportunity generation
  - recommendation generation, apply, and reject
  - content brief generation and publish
  - internal link suggestion generation and apply
  - product SEO draft generation and manual apply
  - SEO change log
  - AI-assisted draft generation using shared `ai.*` provider config
- Product research:
  - research dashboard and candidate list
  - candidate detail with score snapshot, supplier comparison, risk flags, and decisions
  - import workflow entry points for AI, candidate CSV, supplier quotes, and Alibaba links
  - supplier library
  - import preview and commit flows
  - scoring rule activation
  - risk review
  - test launch persistence
  - decision persistence
  - batch recalculation and manual score adjustment
  - convert-to-product API guarded behind approved status and blocking-risk checks
  - audit logging for candidate create, score adjustment, decision, scoring-rule activation, and convert
  - domain-service structure for:
    - candidates
    - imports
    - assessment
    - workflow
- Analytics:
  - dashboard analytics
  - sales analytics
  - product analytics
  - funnel analytics
- Marketing:
  - merchant feed overview
  - merchant feed export in `json` or `xml`
- Settings:
  - storefront settings read and update
  - public storefront settings endpoint
  - copy config read and update
  - public copy snapshot endpoint

## Data Model Summary

### Storefront seed content

- `data/products.ts`
  - local product catalog used for sitemap and static content relationships
- `data/guides.ts`
  - local guide content system
- `data/collection-pages.ts`
  - category SEO configuration and landing page whitelist
- `data/faq.ts`
  - FAQ page content and FAQPage schema source

### Prisma domain model

Key database entities in `api/prisma/schema.prisma`:

- `Product`
- `ProductVariant`
- `ProductImage`
- `Collection`
- `ProductCollection`
- `Order`
- `OrderItem`
- `PaymentEvent`
- `InventoryMovement`
- `ProductCandidate`
- `ProductCandidateScore`
- `Supplier`
- `ProductCandidateSupplier`
- `ProductResearchSignal`
- `ProductTestLaunch`
- `ProductResearchDecision`
- `ProductResearchImportBatch`
- `ProductResearchRiskFlag`
- `ScoringRule`

## Product Research Scoring

- Final Score uses the weighted model:
  - `MarketDemand * 0.15`
  - `TrendSeasonality * 0.10`
  - `CompetitionGap * 0.10`
  - `MarginPotential * 0.15`
  - `LogisticsFit * 0.10`
  - `Brandability * 0.15`
  - `SupplierQuality * 0.10`
  - `RiskInverse * 0.10`
  - `Testability * 0.05`
- `RiskInverse = 100 - RiskScore`
- Validated score after test launch:
  - `Validated Score = Initial Score * 0.6 + Test Score * 0.4`
- High and blocking risk flags override score-based optimism:
  - `RiskScore >= 70` routes the candidate to `HIGH_RISK_REVIEW`
  - `BLOCKING` risk prevents convert to product draft
- Convert safety rules:
  - AI can generate candidates, scores, and drafts
  - AI cannot auto-publish a product
  - AI cannot auto-order inventory
  - convert always creates `Product.status = DRAFT`

## Product Research Import Templates

- Candidate template:
  - [docs/product-research-import-template-candidates.csv](/C:/good/HighFashion/docs/product-research-import-template-candidates.csv)
- Supplier quote template:
  - [docs/product-research-import-template-supplier-quotes.csv](/C:/good/HighFashion/docs/product-research-import-template-supplier-quotes.csv)

Expected candidate CSV columns:
- `product_name`
- `chinese_name`
- `category`
- `target_market`
- `target_audience`
- `use_case`
- `alibaba_keywords`
- `notes`

Expected supplier quote CSV columns:
- `product_name`
- `supplier_name`
- `supplier_url`
- `platform`
- `moq`
- `sample_price`
- `unit_price`
- `shipping_to_us`
- `shipping_to_uk`
- `lead_time_days`
- `custom_logo_moq`
- `custom_packaging_moq`
- `trade_assurance`
- `verified_supplier`
- `certifications`
- `notes`

## Product Research Workflow

1. Import or create candidates manually.
2. Review duplicates before commit.
3. Collect or enter supplier and market signals.
4. Run scoring and risk review.
5. Record manual decisions such as `SAMPLE`, `TEST`, `WATCH`, `APPROVE`, or `REJECT`.
6. Capture test launch data and validated score.
7. Convert only approved, non-blocked candidates into `Product` drafts.

### Product Research implementation status

Implemented now:

- AI preview and commit
- candidate CSV preview and commit
- supplier quote CSV preview and commit
- Alibaba link preview and commit
- deterministic scoring and risk evaluation
- test score and validated score persistence
- convert-to-product draft safeguards
- audit logging on critical write paths

Still pending or intentionally partial:

- full duplicate resolution workflow with stronger merge review UX
- richer supplier management and quote history
- more complete scoring explainability UI
- external market signal providers beyond local fallback
- broader multi-provider AI runtime unification beyond the current shared config layer

## Environment

Copy `.env.example` to `.env` at the repository root and fill the required values.

Required values:

```text
DATABASE_URL="postgresql://pulsegear:pulsegear@localhost:5432/pulsegear?schema=public"
FRONTEND_URL="http://localhost:3000"
API_BASE_URL="http://localhost:4000"
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CURRENCY="usd"
ENABLE_STRIPE_AUTOMATIC_PAYMENT_METHODS=true
ENABLE_PAYPAL=true
ENABLE_BNPL=true
PORT=4000
GSC_SITE_URL="sc-domain:example.com"
GSC_CLIENT_EMAIL="seo-bot@example-project.iam.gserviceaccount.com"
GSC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GA4_PROPERTY_ID="123456789"
GA4_CLIENT_EMAIL="seo-bot@example-project.iam.gserviceaccount.com"
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Notes:

- Keep `STRIPE_SECRET_KEY` server-only.
- The frontend should only use `NEXT_PUBLIC_API_BASE_URL`.
- In production, set `FRONTEND_URL` or `NEXT_PUBLIC_SITE_URL` to the live domain so canonical URLs, sitemap entries, and robots host values are correct.
- `GSC_*` and `GA4_*` are optional. If they are missing, the admin SEO automation UI shows `Not Connected` and falls back to mock-safe data instead of throwing.

### GSC configuration

- Create a Google service account with Search Console access to the target property.
- Grant the service account email access in Search Console for the exact `GSC_SITE_URL`.
- Put the service account email and private key into `.env`.
- Use a Search Console property string such as `sc-domain:pulsegear.com` for domain properties.

### GA4 configuration

- Create a Google service account with GA4 Data API access to the target property.
- Use the numeric property id in `GA4_PROPERTY_ID`.
- Put the service account email and private key into `.env`.
- If credentials are absent, SEO automation and analytics surfaces must keep rendering with `Not Connected`.

## Local Database

You can use either local PostgreSQL or Docker PostgreSQL, as long as `DATABASE_URL` points to a working database.

Docker option:

```bash
docker compose up -d postgres
```

Run migration and seed:

```bash
npm --prefix api run prisma:generate
npm --prefix api run prisma:migrate
npm --prefix api run prisma:seed
```

If the migration already exists and you only need to apply it in a clean database:

```bash
npx --prefix api prisma migrate deploy
```

## Development

Install dependencies:

```bash
npm install
npm --prefix api install
```

Run API:

```bash
npm run dev:api
```

Run frontend:

```bash
npm run dev
```

Run both:

```bash
npm run dev:all
```

Local URLs:

- Frontend: `http://localhost:3000`
- API health: `http://localhost:4000/api/health`

## Stripe Checkout

Checkout flow:

1. Frontend cart stores `variantId` and `quantity`.
2. Frontend calls `POST /api/checkout/session`.
3. API re-queries variant price, stock, product status, and shipping inputs.
4. API creates a `PENDING` order.
5. API creates a Stripe Checkout Session and returns `checkoutUrl`.
6. Stripe redirects back to `/checkout/success?session_id=...`.
7. Frontend success page polls `GET /api/orders/by-session/:sessionId`.
8. Stripe webhook updates the order to `PAID`, `PAYMENT_FAILED`, or `EXPIRED`.
9. On success, the frontend clears cart state.

Webhook events handled:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Webhook behavior:

- verifies Stripe signatures
- stores processed event IDs in `PaymentEvent`
- prevents duplicate order updates
- prevents duplicate stock deductions
- maps Stripe billing and shipping details into the order record

### Local webhook testing

Install Stripe CLI, then run:

```bash
stripe login
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Copy the emitted `whsec_...` into `.env` as `STRIPE_WEBHOOK_SECRET`, then restart the API.

Stripe test card:

```text
4242 4242 4242 4242
Any future expiry
Any CVC
```

## API Endpoints

```text
GET  /api/health
GET  /api/products
GET  /api/products/:slug
GET  /api/collections
GET  /api/collections/:slug/products
POST /api/checkout/session
GET  /api/orders/by-session/:sessionId
GET  /api/orders/:orderNo
POST /api/webhooks/stripe
```

Response format:

```json
{ "success": true, "data": {} }
```

Error format:

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
```

## SEO

The project now has a technical SEO layer across commerce pages and guide content.

- Public pages use `generateMetadata` for route-specific title, description, and canonical.
- `app/sitemap.ts` publishes `/sitemap.xml`.
- `app/robots.ts` publishes `/robots.txt`.
- JSON-LD is implemented for:
  - product pages
  - collection breadcrumbs
  - FAQ page
  - guide article pages
- Duplicate and utility routes are consolidated or excluded:
  - `/products/[slug]` is canonical
  - `/product/[slug]` is `noindex` and canonicalizes to `/products/[slug]`
  - `/collection` is `noindex`
  - `/cart` is `noindex`
  - `/checkout/success` is `noindex`
- Unknown product, guide, and collection paths return `404` with App Router `notFound()`.

### Sitemap policy

- Includes:
  - homepage
  - evergreen static pages
  - canonical product pages
  - base collection pages
  - whitelisted collection landing pages
  - guide detail pages
- Excludes:
  - cart
  - checkout
  - API routes
  - admin
  - filter combinations
  - sort/price/size/color parameter pages

### Real content timestamps

Sitemap `lastModified` now comes from content data instead of build time:

- guides use `publishedAt` / `updatedAt`
- products use local `updatedAt`
- collection pages use local `updatedAt`

This avoids the common problem where every deploy looks like a fresh update to search engines.

### SEO automation

The repo now includes a semi-automated SEO operations layer under `/admin/seo/automation`.

- Health checks scan public homepage, product, collection, guide, FAQ, and approved landing pages.
- GSC sync supports manual trigger now and cron-ready service reuse later.
- GA4 sync supports manual trigger now and cron-ready service reuse later.
- Opportunity, recommendation, internal-link, and content-pipeline outputs are always drafts first.
- Product SEO generation never overwrites live fields until an operator clicks `Apply`.
- Content pipeline never publishes until an operator clicks `Publish`.
- All apply actions must write both `AuditLog` and `SeoChangeLog`.
- AI-assisted draft generation is currently wired for:
  - recommendations
  - internal links
  - opportunities
  - content brief title and outline
  - product SEO draft copy
- AI provider status is visible in the SEO automation overview and uses the shared `ai.*` config layer.

### Cron jobs

MVP ships manual sync buttons first, but the backend service boundaries are ready for scheduled execution.

Recommended production cron jobs:

```text
0 3 * * *   SEO health check
15 3 * * *  GSC sync
30 3 * * *  GA4 sync
45 3 * * *  opportunity + recommendation generation
```

Recommended pattern:

- Run the cron job outside the Next.js frontend.
- Trigger the Nest admin SEO automation services from a trusted worker or scheduler.
- Keep manual sync buttons enabled even after cron is added so operators can force a refresh.
- Do not auto-publish from cron. Cron may only refresh data and generate drafts.

## Verification

Frontend:

```bash
npm run lint
npm run build
```

API:

```bash
npm --prefix api run lint
npm --prefix api test
npm --prefix api run build
```

SEO automation validation:

```bash
npm run lint
npm run build
```

- Visit `/admin/seo/automation`.
- Run manual health check, GSC sync, and GA4 sync.
- Confirm `Not Connected` appears when Google credentials are unset.
- Confirm sitemap and robots still render correctly.
- Confirm product draft generation requires manual `Apply`.
- Confirm content pipeline requires manual `Publish`.

## Current Gaps

- No full CMS yet; content is admin-editable in several domains, but broader content modeling is still application-managed
- No live review system
- No live tax engine
- No country-specific shipping matrix yet
- Some admin analytics and SEO connector surfaces still use mock-safe fallback data when external credentials are missing
- Product Research still needs deeper duplicate resolution, supplier comparison UX, and scoring explainability
- External AI/provider runtime is partially unified at the config layer, but not yet a single shared provider registry across all domains
- No production observability stack yet

## Production TODO

- Configure production PostgreSQL and backups
- Configure Stripe live keys and webhook endpoint
- Verify wallet domain registration for Apple Pay
- Review BNPL and PayPal eligibility by market
- Add tax calculation and country-specific shipping rules
- Add rate limiting, structured logging, and monitoring
- Add broader integration coverage around checkout and webhooks
