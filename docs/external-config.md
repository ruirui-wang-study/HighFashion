# External Configuration

This document lists the environment variables and external credentials used by PulseGear today, plus the planned configuration for the next Product Research integrations.

## 1. Core Runtime

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string | API, Prisma migrations, admin data, orders, SEO, product research |
| `FRONTEND_URL` | Yes | Storefront base URL | Canonical URLs, robots, sitemap, redirects |
| `API_BASE_URL` | Recommended | Internal API base URL | Frontend server-side fetch fallback |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Browser API base URL | Admin UI, storefront client API calls |
| `NEXT_PUBLIC_SITE_URL` | Recommended in production | Public site URL override | SEO metadata, canonical URLs, sitemap |
| `ADMIN_SESSION_SECRET` | Yes | Signs admin session cookies | Admin login, role-protected pages |
| `PORT` | Yes for API process | API port | Nest app runtime |

### How to get them

- `DATABASE_URL`: your PostgreSQL connection string.
- `FRONTEND_URL`: local `http://localhost:3000`, production storefront domain later.
- `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL`: local `http://localhost:4000`, production API domain later.
- `NEXT_PUBLIC_SITE_URL`: usually the same host as `FRONTEND_URL` in production.
- `ADMIN_SESSION_SECRET`: generate a long random secret and keep it server-only.

## 2. Payments

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | Yes for checkout | Stripe server API access | Checkout session creation, payment intent lookup, webhooks |
| `STRIPE_WEBHOOK_SECRET` | Yes for webhook verification | Verifies Stripe webhook signatures | Order payment status updates |
| `STRIPE_CURRENCY` | Recommended | Checkout currency | Checkout session pricing |
| `ENABLE_STRIPE_AUTOMATIC_PAYMENT_METHODS` | Optional | Enables Stripe automatic payment methods | Checkout behavior |
| `ENABLE_PAYPAL` | Optional | Feature flag only right now | Payment method UI/config behavior |
| `ENABLE_BNPL` | Optional | Feature flag only right now | Payment method UI/config behavior |

### How to get them

- Create a Stripe account and use the Developers dashboard.
- Copy `STRIPE_SECRET_KEY` from API keys.
- Use `stripe listen` or the Stripe dashboard to get `STRIPE_WEBHOOK_SECRET`.

## 3. SEO Automation and Analytics

These variables are already recognized by the codebase. If they are missing, the admin UI stays up and shows `Not Connected`.

### Google Search Console

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `GSC_SITE_URL` | Required for real GSC sync | Search Console property identifier | SEO automation sync state, query/page sync |
| `GSC_CLIENT_EMAIL` | Required for real GSC sync | Service account email | Search Console API auth |
| `GSC_PRIVATE_KEY` | Required for real GSC sync | Service account private key | Search Console API auth |

### Google Analytics 4

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `GA4_PROPERTY_ID` | Required for real GA4 sync | Numeric GA4 property id | SEO automation sync state, analytics data |
| `GA4_CLIENT_EMAIL` | Required for real GA4 sync | Service account email | GA4 Data API auth |
| `GA4_PRIVATE_KEY` | Required for real GA4 sync | Service account private key | GA4 Data API auth |

### How to get them

- Create a Google Cloud project.
- Enable Search Console API and Google Analytics Data API.
- Create a service account.
- Grant the service account access to the target Search Console property and GA4 property.
- Store private keys with newline preservation. In `.env`, keep the `\n` escapes.

## 4. Google Merchant Center

These are already referenced by the marketing/feed code.

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `GOOGLE_MERCHANT_ACCOUNT_ID` | Required for real Merchant Center sync | Merchant account id | Merchant feed connection state |
| `GOOGLE_MERCHANT_CLIENT_EMAIL` | Required for real Merchant Center sync | Service account email | Merchant API auth |
| `GOOGLE_MERCHANT_PRIVATE_KEY` | Required for real Merchant Center sync | Service account private key | Merchant API auth |

### How to get them

- Use a Google Cloud service account with Merchant Center access.
- Link or grant access to the correct Merchant Center account.

## 5. Product Research: Planned External Providers

These are not all wired into runtime behavior yet, but they are the intended config surface for the next implementation phase.

### Xiaomi MiMo

MiMo supports two API surfaces:

| Surface | Base URL | Used for |
| --- | --- | --- |
| **Anthropic Messages (Token Plan CN)** | `https://token-plan-cn.xiaomimimo.com/anthropic` | **Recommended** for real keys; SEO + product research + planned Agent (`/v1/messages`, `tool_use`) |
| OpenAI-compatible | `https://api.xiaomimimo.com/v1` | DeepSeek-style `/chat/completions`; official endpoint may reject Token Plan keys (401) |

Auth (either surface): `api-key: $MIMO_API_KEY` or `Authorization: Bearer $MIMO_API_KEY`.

Connectivity check: `cd api && npm run test:mimo`.

Design docs: [admin-ai-agent.md](./admin-ai-agent.md) · [现状能力](./admin-ai-capabilities.md).

Official references:

- MiMo model list and limits: https://platform.xiaomimimo.com/docs/en-US/quick-start/model
- Anthropic API: https://platform.xiaomimimo.com/docs/en-US/api/chat/anthropic-api
- OpenAI-compatible examples: https://platform.xiaomimimo.com/docs/en-US/usage-guide/multimodal-understanding/image-understanding

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `PRODUCT_RESEARCH_AI_PROVIDER` | Recommended | Selects active AI provider | Product research + SEO AI routing |
| `MIMO_API_KEY` | Required for real MiMo calls | MiMo API access | Candidate generation, SEO rewrites, Agent (planned) |
| `MIMO_ANTHROPIC_BASE_URL` | **Recommended (Token Plan)** | Anthropic-compatible root | `llm-json-completion` + Agent turns |
| `MIMO_BASE_URL` | Recommended | OpenAI-compatible root | Fallback / non–Token Plan keys |
| `MIMO_MODEL_CANDIDATE_GENERATION` | Recommended | Model for candidate idea generation | AI import preview/commit |
| `MIMO_MODEL_SCORING` | Recommended | Model slot (metadata / future) | Scoring rationale (not LLM-scored today) |
| `MIMO_MODEL_COPY` | Recommended | Model for copy drafts | SEO + product research copy slot |
| `MIMO_MODEL_SEO_COPY` | Optional | SEO-specific copy model | SEO `seo-ai-runtime` (falls back to copy slot) |
| `MIMO_MODEL_FAST` | Optional | Lower-cost, faster model | Guard / lightweight tasks (planned) |

### OpenAI

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Required for real AI research | OpenAI API access | Candidate generation, scoring reasons, copy generation |
| `OPENAI_MODEL_CANDIDATE_GENERATION` | Recommended | Model for candidate idea generation | AI import preview/commit |
| `OPENAI_MODEL_SCORING` | Recommended | Model for scoring rationale | Product research scoring |
| `OPENAI_MODEL_COPY` | Recommended | Model for landing page/ad/supplier copy drafts | Product research copy helpers |

### Google Trends

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `GOOGLE_TRENDS_PROJECT_ID` | Planned | Project identifier for Trends integration | Trend and seasonality signals |
| `GOOGLE_TRENDS_API_KEY` | Planned | API credential if official access is used | Trend and seasonality signals |

### Etsy

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `ETSY_API_KEY` | Planned | Etsy API access | External market signal collection |
| `ETSY_CLIENT_ID` | Planned | Etsy OAuth/app id | External market signal collection |
| `ETSY_CLIENT_SECRET` | Planned | Etsy OAuth secret | External market signal collection |

### TikTok

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `TIKTOK_CLIENT_KEY` | Planned | TikTok app credential | External market signal collection |
| `TIKTOK_CLIENT_SECRET` | Planned | TikTok app secret | External market signal collection |

### Alibaba

Current MVP does not require official Alibaba API credentials. The first product research import flow can work with:

- pasted Alibaba links
- manual enrichment
- supplier quote CSV

If official Alibaba API access is added later, define variables only after the real integration path is chosen.

## 6. Required by Priority

### Minimum required to run the project

- `DATABASE_URL`
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ADMIN_SESSION_SECRET`

### Required to remove current SEO/analytics fallback behavior

- `GSC_SITE_URL`
- `GSC_CLIENT_EMAIL`
- `GSC_PRIVATE_KEY`
- `GA4_PROPERTY_ID`
- `GA4_CLIENT_EMAIL`
- `GA4_PRIVATE_KEY`

### Required for real AI (MiMo Token Plan)

- `PRODUCT_RESEARCH_AI_PROVIDER=mimo`
- `MIMO_API_KEY`
- `MIMO_ANTHROPIC_BASE_URL` (e.g. `https://token-plan-cn.xiaomimimo.com/anthropic`)
- `MIMO_MODEL_CANDIDATE_GENERATION`
- `MIMO_MODEL_COPY` (SEO rewrites use this or `MIMO_MODEL_SEO_COPY`)

### Required for real AI Product Research with OpenAI

- `OPENAI_API_KEY`
- `OPENAI_MODEL_CANDIDATE_GENERATION`
- `OPENAI_MODEL_SCORING`
- `OPENAI_MODEL_COPY`

## 7. Suggested `.env` Skeleton

```env
DATABASE_URL="postgresql://pulsegear:pulsegear@localhost:5432/pulsegear?schema=public"

FRONTEND_URL="http://localhost:3000"
API_BASE_URL="http://localhost:4000"
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

ADMIN_SESSION_SECRET="replace_with_a_long_random_secret"

STRIPE_SECRET_KEY="sk_test_replace_me"
STRIPE_WEBHOOK_SECRET="whsec_replace_me"
STRIPE_CURRENCY="usd"
ENABLE_STRIPE_AUTOMATIC_PAYMENT_METHODS=true
ENABLE_PAYPAL=true
ENABLE_BNPL=true

GSC_SITE_URL="sc-domain:example.com"
GSC_CLIENT_EMAIL="seo-bot@example-project.iam.gserviceaccount.com"
GSC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

GA4_PROPERTY_ID="123456789"
GA4_CLIENT_EMAIL="seo-bot@example-project.iam.gserviceaccount.com"
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

GOOGLE_MERCHANT_ACCOUNT_ID="123456789"
GOOGLE_MERCHANT_CLIENT_EMAIL="merchant-bot@example-project.iam.gserviceaccount.com"
GOOGLE_MERCHANT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

OPENAI_API_KEY="sk-..."
OPENAI_MODEL_CANDIDATE_GENERATION="gpt-5"
OPENAI_MODEL_SCORING="gpt-5"
OPENAI_MODEL_COPY="gpt-5-mini"

PRODUCT_RESEARCH_AI_PROVIDER="mimo"
MIMO_API_KEY="mimo_mock_replace_me"
MIMO_ANTHROPIC_BASE_URL="https://token-plan-cn.xiaomimimo.com/anthropic"
MIMO_BASE_URL="https://api.xiaomimimo.com/v1"
MIMO_MODEL_CANDIDATE_GENERATION="mimo-v2.5-pro"
MIMO_MODEL_SCORING="mimo-v2.5-pro"
MIMO_MODEL_COPY="mimo-v2.5-pro"
MIMO_MODEL_FAST="mimo-v2-flash"

GOOGLE_TRENDS_PROJECT_ID="example-project"
GOOGLE_TRENDS_API_KEY=""

ETSY_API_KEY=""
ETSY_CLIENT_ID=""
ETSY_CLIENT_SECRET=""

TIKTOK_CLIENT_KEY=""
TIKTOK_CLIENT_SECRET=""
```

## 8. Feishu Inventory Alerts

> 完整支付/库存优化方案与架构图见 [order-payment-inventory.md](./order-payment-inventory.md)。

Used when a paid order is marked `inventoryStatus = SHORT` (payment succeeded but stock confirmation failed).

| Variable | Required | Purpose | Affects |
| --- | --- | --- | --- |
| `FEISHU_ALERT_ENABLED` | Optional | Master switch (`true` / `false`) | Whether alerts are attempted |
| `FEISHU_APP_ID` | Required for live send | Feishu app ID | Tenant access token |
| `FEISHU_APP_SECRET` | Required for live send | Feishu app secret | Tenant access token |
| `FEISHU_ALERT_CHAT_ID` | Required for live send | Target group `chat_id` | Message destination |

### Placeholder / mock mode

If any credential still contains placeholders such as `replace_me` or `cli_replace_me`, the API **does not call Feishu**. It logs a `feishu.mock_send` preview to `api.log` instead.

### How to get them

1. Create a Feishu custom app in [Feishu Open Platform](https://open.feishu.cn/app).
2. Enable bot capability and add the `im:message` permission (send messages).
3. Copy **App ID** and **App Secret** into `FEISHU_APP_ID` / `FEISHU_APP_SECRET`.
4. Add the bot to the target group, then read the group **chat_id** (starts with `oc_`) into `FEISHU_ALERT_CHAT_ID`.

## 9. Notes

- Keep all secrets server-side except `NEXT_PUBLIC_*`.
- Do not commit real private keys or production secrets.
- For Google private keys in `.env`, keep the escaped newline format.
- Product Research external providers should be implemented as optional modules with safe fallback when credentials are absent.
