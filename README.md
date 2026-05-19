# PulseGear Storefront + API

PulseGear is a mobile-first DTC storefront for lightweight support and carry essentials. The project now includes a Next.js storefront plus a NestJS API with PostgreSQL, Prisma, and Stripe Checkout.

## Apps

```text
app/                    Next.js App Router storefront
components/             Reusable storefront UI
lib/api-client.ts       Frontend API client
api/                    NestJS API service
api/prisma/schema.prisma Prisma data model
api/prisma/seed.ts      Product seed data
```

## Environment

Copy `.env.example` to `.env` at the repository root and fill Stripe values:

```bash
cp .env.example .env
```

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
```

Never expose `STRIPE_SECRET_KEY` to the frontend. The frontend only uses `NEXT_PUBLIC_API_BASE_URL`.

## Local Database

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Run migration and seed:

```bash
npm --prefix api run prisma:migrate
npm --prefix api run prisma:seed
```

If the migration already exists and you only need to apply it in a clean database, run:

```bash
npx --prefix api prisma migrate deploy
```

## Development

Install dependencies:

```bash
npm install
npm --prefix api install
```

Generate Prisma client:

```bash
npm --prefix api run prisma:generate
```

Run API:

```bash
npm run dev:api
```

Run frontend:

```bash
npm run dev
```

Or run both:

```bash
npm run dev:all
```

Frontend: `http://localhost:3000`
API: `http://localhost:4000/api/health`

## Stripe Checkout

Checkout flow:

1. Frontend cart stores `variantId` and `quantity`.
2. Frontend calls `POST /api/checkout/session`.
3. API re-queries variant price, stock, product status, and calculates shipping.
4. API creates a `PENDING` order.
5. API creates a Stripe Checkout Session and returns `checkoutUrl`.
6. Stripe redirects to `/checkout/success?session_id=...`.
7. Stripe webhook updates the order to `PAID`, `PAYMENT_FAILED`, or `EXPIRED`.
8. Success page polls `GET /api/orders/by-session/:sessionId` while payment is pending.

### Local Webhook Testing

Install Stripe CLI, then run:

```bash
stripe login
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Copy the `whsec_...` value into `.env` as `STRIPE_WEBHOOK_SECRET` and restart the API.

Test payment with Stripe test card:

```text
4242 4242 4242 4242
Any future expiry
Any CVC
```

Webhook events handled:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Webhook signatures are verified with `STRIPE_WEBHOOK_SECRET`. Processed Stripe event IDs are stored in `PaymentEvent` to prevent duplicate processing and duplicate stock deductions.

## Payment Methods

The API uses Stripe Checkout with `automatic_payment_methods.enabled = true` by default. Stripe decides which methods to show based on buyer country, currency, device, browser, and Stripe Dashboard settings.

Expected behavior:

- Cards are shown when enabled.
- Apple Pay / Google Pay wallets appear automatically on supported devices and domains.
- Link appears when available and enabled.
- Klarna / Afterpay / Clearpay appear when the account, buyer country, currency, and order amount are eligible.
- PayPal can appear through Stripe Checkout only if the Stripe account country and currency support it. The code keeps a payment provider abstraction so PayPal can later be enabled through Stripe or another provider without hardcoding checkout business logic.

Configure payment methods in Stripe Dashboard under Payment methods. Keep `ENABLE_STRIPE_AUTOMATIC_PAYMENT_METHODS=true` for the MVP.

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

All API responses use:

```json
{ "success": true, "data": {} }
```

Errors use:

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
```

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

## Production TODO

- Configure production PostgreSQL and managed backups.
- Configure Stripe live keys and webhook endpoint.
- Verify wallet domain registration for Apple Pay.
- Review BNPL and PayPal eligibility per target market.
- Add authenticated admin workflows for product, inventory, and fulfillment.
- Add tax calculation and country-specific shipping tables.
- Add rate limiting, structured logging, and API monitoring.
- Add more integration tests around checkout and webhook idempotency.
