# PulseGear Storefront + API

<p align="center">
  <a href="README.md">Home</a>
  &nbsp;|&nbsp;
  <strong>English</strong>
  &nbsp;|&nbsp;
  <a href="README.zh-CN.md">简体中文</a>
</p>

PulseGear is a mobile-first DTC ecommerce project for lightweight support, carry, hydration, sweat-control, and recovery gear. This repository contains a **Next.js** storefront and a **NestJS** API backed by **PostgreSQL**, **Prisma**, and **Stripe Checkout**.

**Status snapshot:** `2026-05-27`

---

## Table of contents

1. [Architecture](#1-architecture)
2. [Project status](#2-project-status)
3. [Features](#3-features)
4. [Product research](#4-product-research)
5. [SEO](#5-seo)
6. [Admin AI](#6-admin-ai)
7. [Data model](#7-data-model)
8. [Configuration & local development](#8-configuration--local-development)
9. [Stripe checkout](#9-stripe-checkout)
10. [Storefront API](#10-storefront-api)
11. [Verification](#11-verification)
12. [Gaps & production checklist](#12-gaps--production-checklist)
13. [Related documentation](#13-related-documentation)

---

## 1. Architecture

```text
app/                         Next.js App Router pages and metadata routes
components/                  Reusable storefront UI, cart state, SEO helpers
data/                        Local content and SEO seed data
lib/                         Shared frontend utilities, types, SEO builders
api/                         NestJS API service
api/prisma/                  Prisma schema, migrations, seed script
docs/                        Operational and design documentation
```

### Frontend

| Area | Stack / notes |
|------|----------------|
| Framework | Next.js App Router, TypeScript, Tailwind CSS |
| Cart | `components/cart-provider.tsx`, variant-aware (`variantId`) |
| API client | `lib/api-client.ts` |
| SEO | `app/sitemap.ts`, `app/robots.ts`, `lib/seo.ts`, `lib/structured-data.ts` |

**Storefront routes (main):** `/`, `/shop`, `/products/[slug]`, `/collections/[...segments]`, `/cart`, `/checkout/success`, `/guides`, `/guides/[slug]`, `/faq`, `/fit-guide`, `/about`

**Admin routes (main):** `/admin/login`, `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/inventory`, `/admin/content`, `/admin/seo`, `/admin/product-research/*`, `/admin/analytics`, `/admin/marketing/merchant-feed`, `/admin/settings`

### Backend

| Area | Stack / notes |
|------|----------------|
| Framework | NestJS |
| Database | PostgreSQL + Prisma |
| Payments | Stripe Checkout + webhooks |

**API modules:** `health`, `products`, `collections`, `checkout`, `orders`, `payments`, `webhooks`, `admin-auth`, `admin-products`, `admin-orders`, `admin-content`, `admin-seo`, `product-research`, `seo-automation`, `admin-analytics`, `admin-marketing`, `admin-settings`

---

## 2. Project status

### Maturity by area

| Area | Maturity |
|------|----------|
| Commerce core | Stable MVP |
| Admin operations | Stable MVP |
| Product research | Usable internal alpha |
| SEO automation | Usable internal alpha (AI-assisted drafts) |
| External integrations | Partial — mock-safe when credentials missing |

### Recent capabilities

- End-to-end storefront + admin: browse, cart, Stripe Checkout, orders, inventory, content, SEO, analytics, settings
- **Product research:** persistent candidates, multi-source import, scoring, risk, test launches, decisions, convert-to-product safeguards
- **SEO automation:** AI-assisted recommendations, internal links, opportunities, briefs, product SEO drafts (manual Apply/Publish)
- **Shared AI config:** `ai.*` site settings with backward compatibility for `product_research.ai.*`
- **Bilingual content (EN/ZH):** products, FAQ, guides, collection landings, static pages, home copy blocks
- **Service split:** product-research and seo-automation split into domain services (not monoliths)

---

## 3. Features

### 3.1 Storefront

- Product listing, collections, PDP with sticky mobile add-to-cart and trust/shipping blocks
- Stripe Checkout; order created before redirect; success page polls by session ID
- Public order lookup by order number or checkout session ID
- Webhook-driven statuses: `PENDING`, `PAID`, `PAYMENT_FAILED`, `EXPIRED`
- Inventory deduction on payment; cart reconciliation before checkout
- Scenario navigation: **Run**, **Train**, **Court**, **Recover**
- Public settings and copy snapshot endpoints

### 3.2 Content & guides

- Guides at `/guides` and `/guides/[slug]` (`data/guides.ts`)
- Article JSON-LD, TOC, FAQ, related products/collections/guides

### 3.3 Collection SEO

- Canonical handler: `app/collections/[...segments]/page.tsx`
- Indexable base categories: `support`, `carry`, `hydration`, `socks`, `sweat`, `recovery`
- Whitelisted SEO landings (e.g. `/collections/running/knee-support`)
- Filter/sort/price/size/color query URLs: `noindex, follow` with canonical to base or landing
- Config: `data/collection-pages.ts`

### 3.4 Admin & operations

| Domain | Capabilities |
|--------|----------------|
| Auth | Cookie session; roles: `VIEWER`, `OPERATOR`, `CONTENT_EDITOR`, `ANALYST`, `ADMIN`, `SUPER_ADMIN` |
| Products & inventory | CRUD, stock adjustments, movement history |
| Orders | Search, filters, notes, fulfill, Stripe metadata |
| Content | Guides, FAQ, bilingual EN/ZH editing, publish workflow |
| SEO reporting | Overview, page/query performance |
| SEO automation | Health check, GSC/GA4 sync, opportunities, recommendations, briefs, internal links, product SEO drafts, change log |
| Product research | Dashboard, candidates, imports, scoring rules, risk review, test launches, decisions, batch recalc |
| Analytics | Dashboard, sales, product, funnel |
| Marketing | Merchant feed export (JSON/XML) |
| Settings | Storefront settings, copy config, AI provider slots |

---

## 4. Product research

### Scoring model

Weighted **final score** (default weights):

- MarketDemand 15%, TrendSeasonality 10%, CompetitionGap 10%, MarginPotential 15%
- LogisticsFit 10%, Brandability 15%, SupplierQuality 10%, RiskInverse 10%, Testability 5%
- `RiskInverse = 100 - RiskScore`

**Validated score (after test):** `Initial * 0.6 + Test * 0.4`

**Risk gates:** `RiskScore >= 70` → `HIGH_RISK_REVIEW`; `BLOCKING` risk blocks convert.

**Safety:** AI may generate candidates and drafts; **cannot** auto-publish or auto-order; convert always creates `Product.status = DRAFT`.

### Import templates

- [Candidate CSV template](docs/product-research-import-template-candidates.csv)
- [Supplier quote CSV template](docs/product-research-import-template-supplier-quotes.csv)

**Candidate columns:** `product_name`, `chinese_name`, `category`, `target_market`, `target_audience`, `use_case`, `alibaba_keywords`, `notes`

**Supplier quote columns:** `product_name`, `supplier_name`, `supplier_url`, `platform`, `moq`, `sample_price`, `unit_price`, `shipping_to_us`, `shipping_to_uk`, `lead_time_days`, `custom_logo_moq`, `custom_packaging_moq`, `trade_assurance`, `verified_supplier`, `certifications`, `notes`

### Workflow

1. Import or create candidates → 2. Review duplicates → 3. Signals & suppliers → 4. Score & risk → 5. Decision (`SAMPLE` / `TEST` / `WATCH` / `APPROVE` / `REJECT`) → 6. Test launch & validated score → 7. Convert approved, non-blocked candidates to product drafts

### Implementation status

| Done | Pending / partial |
|------|-------------------|
| AI / CSV / supplier / Alibaba import | Richer duplicate-merge UX |
| Deterministic scoring & risk | Supplier quote history UI |
| Test & validated score | Scoring explainability UI |
| Convert safeguards & audit | Real external signal providers (GSC/Trends) |
| Domain service split | Planned multi-agent layer (see AI docs) |

---

## 5. SEO

### Public technical SEO

- Per-route `generateMetadata`, canonical, Open Graph
- `/sitemap.xml`, `/robots.txt`
- JSON-LD: Product, BreadcrumbList, FAQPage, Article
- Consolidation: `/product/[slug]` → canonical `/products/[slug]`; `noindex` cart, checkout, admin, filter combos
- Sitemap `lastModified` from content timestamps (not build time)

### SEO automation (`/admin/seo/automation`)

- Health scan of homepage, products, collections, guides, FAQ, approved landings
- Manual GSC / GA4 sync (cron-ready); `Not Connected` when credentials missing
- Drafts first: opportunities, recommendations, internal links, briefs, product SEO
- **Apply** / **Publish** are manual; writes `AuditLog` + `SeoChangeLog`

**Suggested production cron (draft generation only, no auto-publish):**

```text
0 3 * * *   SEO health check
15 3 * * *  GSC sync
30 3 * * *  GA4 sync
45 3 * * *  opportunity + recommendation generation
```

Details: [docs/seo-automation-capabilities.md](docs/seo-automation-capabilities.md)

---

## 6. Admin AI

### Current (shipped)

| Module | LLM usage |
|--------|-----------|
| Product research | AI candidate generation (MiMo / DeepSeek); scoring is **rule-based** |
| SEO automation | Rewrite drafts (MiMo / DeepSeek) |
| Fallback | Local templates when provider fails |

**MiMo Token Plan:** set `MIMO_ANTHROPIC_BASE_URL` (e.g. `https://token-plan-cn.xiaomimimo.com/anthropic`). Test: `cd api && npm run test:mimo`

### Planned (documented, not implemented)

Multi-agent admin layer (Research / SeoOps / Copy + Guard): see [docs/admin-ai-agent.md](docs/admin-ai-agent.md)

| Doc | Purpose |
|-----|---------|
| [admin-ai-capabilities.md](docs/admin-ai-capabilities.md) | What works today |
| [admin-ai-agent-design.md](docs/admin-ai-agent-design.md) | Architecture & roadmap |
| [admin-ai-agent-technical-mitigations.md](docs/admin-ai-agent-technical-mitigations.md) | Pitfalls & fixes |

---

## 7. Data model

### Local seeds (`data/`)

- `products.ts` — catalog for sitemap / relationships
- `guides.ts`, `collection-pages.ts`, `faq.ts`

### Prisma (key entities)

`Product`, `ProductVariant`, `ProductImage`, `Collection`, `Order`, `OrderItem`, `PaymentEvent`, `InventoryMovement`, `ProductCandidate`, `ProductCandidateScore`, `Supplier`, `ProductCandidateSupplier`, `ProductResearchSignal`, `ProductTestLaunch`, `ProductResearchDecision`, `ProductResearchImportBatch`, `ProductResearchRiskFlag`, `ScoringRule`

Schema: `api/prisma/schema.prisma`

---

## 8. Configuration & local development

Copy `.env.example` → `.env`. See [docs/external-config.md](docs/external-config.md) for all providers.

**Minimum:**

```text
DATABASE_URL=postgresql://...
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Optional:** `GSC_*`, `GA4_*`, `MIMO_*`, `DEEPSEEK_*`, `PRODUCT_RESEARCH_AI_PROVIDER`

### Database

```bash
docker compose up -d postgres          # optional
npm --prefix api run prisma:generate
npm --prefix api run prisma:migrate
npm --prefix api run prisma:seed
# or: npx --prefix api prisma migrate deploy
```

### Dev servers

```bash
npm install && npm --prefix api install
npm run dev:api      # API :4000
npm run dev          # Web :3000
npm run dev:all      # both
```

**Logs:** `npm run dev` / `dev:api` write to `logs/` via `scripts/run-with-log.mjs`

**OpenAPI (admin domains):**

```bash
npm run openapi:types
npm run openapi:check
```

---

## 9. Stripe checkout

Full detail: [docs/order-payment-inventory.md](docs/order-payment-inventory.md)

**Flow:** cart → `POST /api/checkout/session` → reserve stock + `PENDING` order → Stripe redirect → webhook → `PAID` / failed / expired → cart cleared on success

**Webhook events:** `checkout.session.completed`, `async_payment_succeeded`, `async_payment_failed`, `expired`

**Local testing:**

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
# Set whsec_... in STRIPE_WEBHOOK_SECRET, restart API
```

Test card: `4242 4242 4242 4242`

---

## 10. Storefront API

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

**Success:**

```json
{ "success": true, "data": {} }
```

**Error:**

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

Admin APIs are under `/api/admin/*` (session cookie required).

---

## 11. Verification

```bash
# Frontend
npm run lint && npm run build

# API
npm --prefix api run lint
npm --prefix api test
npm --prefix api run build

# OpenAPI contract
npm run openapi:check
```

**SEO automation smoke:** `/admin/seo/automation` → health check, sync buttons, draft Apply/Publish, sitemap/robots.

---

## 12. Gaps & production checklist

### Current gaps

- No full CMS; content remains application-managed in places
- No live reviews, tax engine, or country shipping matrix
- Analytics / SEO connectors may use mock data without credentials
- Product research: duplicate UX, signal providers, scoring explainability
- No production observability stack yet

### Production TODO

- [ ] Production PostgreSQL + backups
- [ ] Stripe live keys + webhook URL
- [ ] Apple Pay domain verification; BNPL/PayPal market rules
- [ ] Tax and shipping rules
- [ ] Rate limiting, structured logging, monitoring
- [ ] SEO cron worker (no auto-publish from cron)

---

## 13. Related documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Language hub |
| [README.zh-CN.md](README.zh-CN.md) | 简体中文全文 |
| [docs/external-config.md](docs/external-config.md) | Environment variables |
| [docs/seo-automation-capabilities.md](docs/seo-automation-capabilities.md) | SEO automation scope |
| [docs/admin-ai-agent.md](docs/admin-ai-agent.md) | Admin AI index |
| [docs/order-payment-inventory.md](docs/order-payment-inventory.md) | Payments & inventory |
| [docs/user-guide-zh.md](docs/user-guide-zh.md) | Chinese user guide |
| [AGENTS.md](AGENTS.md) | Brand, SEO, and dev conventions |

---

<p align="center">
  <a href="README.md">Home</a>
  &nbsp;|&nbsp;
  <strong>English</strong>
  &nbsp;|&nbsp;
  <a href="README.zh-CN.md">简体中文</a>
</p>
