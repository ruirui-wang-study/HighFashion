# Admin SEO Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a three-page admin SEO Center with mock Search Console fallback, page/query reporting, and real local SEO health scoring.

**Architecture:** Add a dedicated Nest `admin-seo` module with a Search Console provider interface, a mock fallback provider, a sync service skeleton, and a local health analysis service. The Next.js admin UI consumes typed page-specific payloads and renders overview, pages, and queries routes with reusable SEO badges and score components.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, NestJS, Prisma, Jest

---

### Task 1: Define Backend SEO Contracts

**Files:**
- Create: `api/src/admin-seo/admin-seo.types.ts`
- Create: `api/src/admin-seo/dto/admin-seo-query.dto.ts`

- [ ] **Step 1: Write the failing test**

Create a new `admin-seo.service.spec.ts` that imports the intended service/types.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix api test -- admin-seo.service.spec.ts`
Expected: FAIL because backend SEO files do not exist.

- [ ] **Step 3: Write minimal implementation**

Add shared response types and a `days` DTO supporting `7`, `30`, and `90`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix api test -- admin-seo.service.spec.ts`
Expected: test progresses to the next missing implementation.

### Task 2: Add SEO Service With Mock Search Console Fallback

**Files:**
- Create: `api/src/admin-seo/admin-seo.service.ts`
- Create: `api/src/admin-seo/search-console-provider.interface.ts`
- Create: `api/src/admin-seo/search-console-mock.provider.ts`
- Create: `api/src/admin-seo/search-console-sync.service.ts`
- Test: `api/src/admin-seo/admin-seo.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Cover:
- overview returns mock Search Console metrics with `Not Connected`
- page health score deducts for missing title/description/canonical/structured data
- page list includes visible health score and issue flags
- query list returns mock fallback rows

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix api test -- admin-seo.service.spec.ts`
Expected: FAIL because service logic is missing.

- [ ] **Step 3: Write minimal implementation**

Implement:
- Search Console provider boundary
- mock fallback provider
- sync service skeleton
- SEO health scoring helpers
- overview/pages/queries service methods

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix api test -- admin-seo.service.spec.ts`
Expected: PASS

### Task 3: Expose Admin SEO API Endpoints

**Files:**
- Create: `api/src/admin-seo/admin-seo.controller.ts`
- Create: `api/src/admin-seo/admin-seo.module.ts`
- Modify: `api/src/app.module.ts`

- [ ] **Step 1: Write the failing test**

Extend backend tests or compile checks to reference the new endpoints.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix api run build`
Expected: FAIL until module/controller wiring exists.

- [ ] **Step 3: Write minimal implementation**

Add guarded endpoints:
- `/admin/seo/overview`
- `/admin/seo/pages`
- `/admin/seo/queries`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix api run build`
Expected: PASS

### Task 4: Add Frontend SEO Center Types And API Client

**Files:**
- Create: `lib/admin-seo-types.ts`
- Modify: `lib/admin-api.ts`

- [ ] **Step 1: Write the failing test**

Use the Next build as the first consumer check by wiring page components to missing helpers.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build`
Expected: FAIL once pages reference missing types/helpers.

- [ ] **Step 3: Write minimal implementation**

Add SEO Center response types and fetch helpers.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`
Expected: progresses to remaining missing page components.

### Task 5: Build Shared SEO Center UI

**Files:**
- Create: `components/admin/admin-search-console-badge.tsx`
- Create: `components/admin/admin-seo-health-badge.tsx`
- Create: `components/admin/admin-seo-health-score.tsx`
- Modify or Reuse: existing admin shared panels

- [ ] **Step 1: Write the failing test**

Reference these shared components from SEO pages before they exist.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build`
Expected: FAIL because shared SEO components are missing.

- [ ] **Step 3: Write minimal implementation**

Implement lightweight reusable SEO-specific UI pieces and reuse existing admin chart/table panels where practical.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`
Expected: progresses to route/page wiring.

### Task 6: Implement SEO Overview, Pages, And Queries Routes

**Files:**
- Create: `components/admin/admin-seo-overview-page.tsx`
- Create: `components/admin/admin-seo-pages-page.tsx`
- Create: `components/admin/admin-seo-queries-page.tsx`
- Modify: `app/admin/seo/page.tsx`
- Create: `app/admin/seo/pages/page.tsx`
- Create: `app/admin/seo/queries/page.tsx`

- [ ] **Step 1: Write the failing test**

Wire the new routes to missing components.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build`
Expected: FAIL because page components/routes do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add:
- SEO overview with KPIs, top queries, top pages, pages losing traffic, and health summary
- SEO pages table with health score
- SEO queries table with landing page/country/device

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`
Expected: PASS

### Task 7: Final Verification

**Files:**
- Verify only

- [ ] **Step 1: Run backend SEO tests**

Run: `npm --prefix api test -- admin-seo.service.spec.ts`
Expected: PASS

- [ ] **Step 2: Run backend build**

Run: `npm --prefix api run build`
Expected: PASS

- [ ] **Step 3: Run storefront lint and build**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS
