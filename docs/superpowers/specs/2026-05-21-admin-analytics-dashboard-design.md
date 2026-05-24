# Admin Analytics Dashboard Design

## Summary

Build four admin analytics pages for PulseGear:

- `/admin/dashboard`
- `/admin/analytics/sales`
- `/admin/analytics/products`
- `/admin/analytics/funnel`

The first delivery uses the local order database as the primary source for sales and purchase metrics. GA4 is not connected in this phase. Behavior metrics that normally depend on GA4 use mock fallback data and must display `Not Connected` without breaking the page.

Default reporting range is `7 days`, with UI prepared for `30 days` and `90 days`.

## Goals

- Show real order-driven metrics on the dashboard.
- Provide usable chart and table views across all four pages.
- Avoid runtime errors when GA4 is not configured.
- Keep the implementation lightweight and aligned with the current admin architecture.
- Pass `npm run build`.

## Non-Goals

- Real GA4 integration in this phase.
- Complex BI interactions such as drill-down, export, or custom date pickers.
- Replacing the current admin auth or admin navigation model.

## Data Rules

### Sales source

Use the local Prisma order database for:

- GMV
- orders
- AOV
- revenue trend
- orders trend
- AOV trend
- sales by country
- purchases
- revenue by product
- top products
- recent orders

### Inventory source

Use local Prisma product variant data for:

- low stock alerts

### Mock analytics fallback

Use a mock analytics provider for:

- conversion rate
- sessions
- product views
- add to cart
- begin checkout
- funnel drop-off inputs

Every analytics response must include:

- `ga4.connected = false`
- `ga4.status = "Not Connected"`

## Metric Definitions

- Sales metrics only count orders with status `PAID` or `FULFILLED`.
- Trend charts group by day.
- `GMV = sum(totalCents)` over paid/fulfilled orders in range.
- `orders = count(paid/fulfilled orders)` in range.
- `AOV = GMV / orders`, with zero-safe fallback.
- `conversion rate = purchases / sessions`, where purchases come from paid/fulfilled orders and sessions come from mock analytics.
- `top products` rank by revenue descending, then units sold descending.
- `recent orders` use latest created orders and display status.
- `low stock alerts` include active variants where `stock <= lowStockThreshold`.
- `drop-off rate` is computed step-to-step in the funnel.

## Routes

### Frontend routes

- `/admin/dashboard`
- `/admin/analytics/sales`
- `/admin/analytics/products`
- `/admin/analytics/funnel`

### Backend routes

- `/api/admin/analytics/dashboard?days=7`
- `/api/admin/analytics/sales?days=7`
- `/api/admin/analytics/products?days=7`
- `/api/admin/analytics/funnel?days=7`

## Backend Design

### New module

Add an `admin-analytics` Nest module with:

- controller
- service
- mock analytics provider
- DTO for `days`

### Service responsibilities

The service owns aggregation logic and returns stable response shapes for the frontend. It must:

- read local order and order item data
- aggregate paid/fulfilled sales metrics
- aggregate low stock inventory alerts
- merge mock behavior metrics
- return zero-safe structures when no orders exist

### Response shapes

The module will return page-specific payloads:

- dashboard summary payload
- sales analytics payload
- product analytics payload
- funnel analytics payload

Each payload includes:

- `rangeDays`
- `ga4`
- page-specific metric groups

## Frontend Design

### Pages

Implement four dedicated page components:

- `components/admin/admin-dashboard-page.tsx`
- `components/admin/admin-sales-analytics-page.tsx`
- `components/admin/admin-product-analytics-page.tsx`
- `components/admin/admin-funnel-analytics-page.tsx`

### Shared UI

Add lightweight shared components:

- `admin-kpi-card`
- `admin-chart-panel`
- `admin-table-panel`
- `admin-connection-badge`

### Chart strategy

Do not add a large chart dependency. Use lightweight SVG or CSS-driven charts that are sufficient for:

- line trend display
- bar comparison display
- funnel step display

This keeps the bundle small and avoids unnecessary dependency cost.

### Range selector

All four pages show a simple range switcher for:

- `7d`
- `30d`
- `90d`

The default active value is `7d`.

## Page Content

### Dashboard

Show:

- GMV
- orders
- AOV
- conversion rate
- top products
- low stock alerts
- recent orders

### Sales Analytics

Show:

- revenue trend
- orders trend
- AOV trend
- sales by country

### Product Analytics

Show:

- product views
- add to cart
- purchases
- revenue by product

### Funnel Analytics

Show:

- sessions
- product views
- add to cart
- begin checkout
- purchase
- drop-off rate

## Error Handling

- Empty order data returns valid zero-state cards, charts, and tables.
- Missing GA4 configuration never throws UI errors.
- Mock analytics provider failures fall back to static safe values.
- Frontend loading and error states follow the existing admin page pattern.

## Access Control

- `/admin/dashboard` stays available to current dashboard roles.
- `/admin/analytics/*` stays behind analyst-capable navigation and page guards.
- Backend endpoints use the existing admin auth guard and role decorators.

## Testing

### Backend

Add unit tests for analytics aggregation covering:

- empty dataset
- paid orders only
- mixed order statuses
- country grouping
- top products ranking
- funnel purchase count
- GA4 fallback response shape

### Frontend

Verify:

- pages render without GA4 config
- zero-state rendering works
- range switching updates data requests

### Final verification

Run:

- `npm run build`

Optionally run:

- storefront lint
- relevant API tests or build if introduced

## Implementation Plan

1. Add backend analytics module, DTOs, mock provider, and aggregation service.
2. Add frontend admin analytics API client types and fetch helpers.
3. Build shared analytics UI components.
4. Replace dashboard placeholder content with real analytics data.
5. Add sales, products, and funnel analytics pages.
6. Add backend tests for core aggregation logic.
7. Run build verification and fix any integration issues.
