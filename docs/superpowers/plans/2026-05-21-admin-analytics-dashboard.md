# Admin Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build real admin sales dashboards backed by the local order database, with mock GA4 fallback for behavior metrics, across dashboard, sales, product, and funnel analytics pages.

**Architecture:** Add a dedicated Nest admin analytics module that aggregates Prisma order, order item, and inventory data into page-specific payloads. The Next.js admin UI consumes these payloads through typed fetch helpers and renders lightweight reusable chart and table panels without adding a heavyweight chart library.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, NestJS, Prisma, Jest

---

### Task 1: Define Backend Analytics Contracts

**Files:**
- Create: `api/src/admin-analytics/admin-analytics.types.ts`
- Create: `api/src/admin-analytics/dto/admin-analytics-query.dto.ts`

- [ ] **Step 1: Write the failing test**

Add a service test that imports the intended response types and query DTO usage through a new analytics service test file.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix api test -- admin-analytics.service.spec.ts`
Expected: FAIL because analytics files do not exist.

- [ ] **Step 3: Write minimal implementation**

Create analytics types and a DTO with `days` constrained to supported ranges.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix api test -- admin-analytics.service.spec.ts`
Expected: test progresses to next missing implementation.

- [ ] **Step 5: Commit**

```bash
git add api/src/admin-analytics
git commit -m "feat: add admin analytics contracts"
```

### Task 2: Add Analytics Aggregation Service

**Files:**
- Create: `api/src/admin-analytics/admin-analytics.service.ts`
- Create: `api/src/admin-analytics/admin-analytics.mock-provider.ts`
- Test: `api/src/admin-analytics/admin-analytics.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Cover:
- empty dataset returns zero-safe dashboard metrics
- paid and fulfilled orders count toward GMV and orders
- country grouping is aggregated correctly
- top products sort by revenue then units
- funnel purchase count comes from paid/fulfilled orders
- fallback GA4 status is `Not Connected`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix api test -- admin-analytics.service.spec.ts`
Expected: FAIL because service logic is missing.

- [ ] **Step 3: Write minimal implementation**

Implement aggregation helpers and mock analytics fallback provider.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix api test -- admin-analytics.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/src/admin-analytics
git commit -m "feat: add admin analytics aggregation service"
```

### Task 3: Expose Admin Analytics API Endpoints

**Files:**
- Create: `api/src/admin-analytics/admin-analytics.controller.ts`
- Create: `api/src/admin-analytics/admin-analytics.module.ts`
- Modify: `api/src/app.module.ts`

- [ ] **Step 1: Write the failing test**

Extend backend tests or add controller-oriented tests for endpoint wiring and response shape.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix api test -- admin-analytics`
Expected: FAIL because controller/module routes are missing.

- [ ] **Step 3: Write minimal implementation**

Add guarded endpoints:
- `/admin/analytics/dashboard`
- `/admin/analytics/sales`
- `/admin/analytics/products`
- `/admin/analytics/funnel`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix api test -- admin-analytics`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/src/admin-analytics api/src/app.module.ts
git commit -m "feat: expose admin analytics endpoints"
```

### Task 4: Add Frontend Analytics Types And API Client

**Files:**
- Create: `lib/admin-analytics-types.ts`
- Modify: `lib/admin-api.ts`

- [ ] **Step 1: Write the failing test**

Use TypeScript build as the first consumer check by wiring future pages to expected client signatures.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build`
Expected: FAIL once page code references missing types/helpers.

- [ ] **Step 3: Write minimal implementation**

Add analytics response types and fetch helpers for each page.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`
Expected: progresses to remaining missing page components.

- [ ] **Step 5: Commit**

```bash
git add lib/admin-analytics-types.ts lib/admin-api.ts
git commit -m "feat: add admin analytics client helpers"
```

### Task 5: Build Shared Analytics UI Components

**Files:**
- Create: `components/admin/admin-kpi-card.tsx`
- Create: `components/admin/admin-chart-panel.tsx`
- Create: `components/admin/admin-table-panel.tsx`
- Create: `components/admin/admin-connection-badge.tsx`
- Create: `components/admin/admin-range-switcher.tsx`

- [ ] **Step 1: Write the failing test**

Use page compilation as the test harness by referencing these shared components from analytics pages.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build`
Expected: FAIL because shared components are missing.

- [ ] **Step 3: Write minimal implementation**

Implement lightweight reusable panels and SVG chart primitives.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`
Expected: progresses to remaining page implementations.

- [ ] **Step 5: Commit**

```bash
git add components/admin
git commit -m "feat: add shared admin analytics UI"
```

### Task 6: Replace Dashboard Placeholder With Real Data

**Files:**
- Create: `components/admin/admin-dashboard-page.tsx`
- Modify: `app/admin/dashboard/page.tsx`

- [ ] **Step 1: Write the failing test**

Run the build after wiring the page to a new component that does not yet exist.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build`
Expected: FAIL because dashboard analytics component is missing.

- [ ] **Step 3: Write minimal implementation**

Render KPI cards, top products, low stock alerts, and recent orders from the backend payload.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`
Expected: dashboard compiles successfully.

- [ ] **Step 5: Commit**

```bash
git add app/admin/dashboard/page.tsx components/admin/admin-dashboard-page.tsx
git commit -m "feat: add admin dashboard analytics page"
```

### Task 7: Add Sales, Product, And Funnel Analytics Pages

**Files:**
- Create: `components/admin/admin-sales-analytics-page.tsx`
- Create: `components/admin/admin-product-analytics-page.tsx`
- Create: `components/admin/admin-funnel-analytics-page.tsx`
- Modify: `app/admin/analytics/page.tsx` if needed
- Create or Modify: `app/admin/analytics/sales/page.tsx`
- Create or Modify: `app/admin/analytics/products/page.tsx`
- Create or Modify: `app/admin/analytics/funnel/page.tsx`
- Modify: `lib/admin-rbac.ts`

- [ ] **Step 1: Write the failing test**

Reference the new routes and components before they exist.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build`
Expected: FAIL because analytics pages/routes are missing.

- [ ] **Step 3: Write minimal implementation**

Add the three analytics pages with range switching, charts, tables, and `Not Connected` behavior indicators.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/admin/analytics components/admin lib/admin-rbac.ts
git commit -m "feat: add admin analytics pages"
```

### Task 8: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run backend analytics tests**

Run: `npm --prefix api test -- admin-analytics`
Expected: PASS

- [ ] **Step 2: Run storefront build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Run frontend lint if page-level edits are substantial**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Summarize any residual gaps**

Document whether GA4 remains mock-only and whether API build was also verified.
