# SEO Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a semi-automated SEO operations system with health checks, GSC/GA4 sync fallback, opportunities, recommendations, content briefs, internal link suggestions, product SEO draft generation, and audit-safe manual apply flows.

**Architecture:** Extend the existing Nest admin SEO, analytics, products, content, and settings foundation with a dedicated `seo-automation` module backed by new Prisma models. Reuse the current admin UI patterns and disconnected fallback behavior so all automation outputs remain drafts until explicitly applied or published by an operator.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, NestJS, Prisma, PostgreSQL, Jest, ESLint

---

### Task 1: Add Prisma SEO Automation Models

**Files:**
- Modify: `api/prisma/schema.prisma`
- Create: `api/prisma/migrations/0008_seo_automation/migration.sql`

- [ ] Add enums and models for SEO automation persistence.
- [ ] Keep draft/apply state explicit in the schema.

### Task 2: Add Backend SEO Automation Types And Tests

**Files:**
- Create: `api/src/seo-automation/seo-automation.types.ts`
- Create: `api/src/seo-automation/seo-automation.service.spec.ts`

- [ ] Write failing tests for health checks, disconnected sync, opportunity generation, recommendations, content briefs, and link suggestions.
- [ ] Verify tests fail before implementation.

### Task 3: Implement SEO Automation Service

**Files:**
- Create: `api/src/seo-automation/seo-automation.service.ts`
- Create: `api/src/seo-automation/google-sync.providers.ts`

- [ ] Implement minimal rule-based service behavior to satisfy tests.
- [ ] Reuse existing product/content/admin settings data and fallback providers.

### Task 4: Expose SEO Automation API

**Files:**
- Create: `api/src/seo-automation/seo-automation.controller.ts`
- Create: `api/src/seo-automation/seo-automation.module.ts`
- Modify: `api/src/app.module.ts`
- Modify: `api/src/admin-products/admin-products.controller.ts`

- [ ] Add guarded admin endpoints for overview, issues, sync, opportunities, recommendations, content pipeline, internal links, change log, and product draft/apply actions.

### Task 5: Add Frontend Types And API Helpers

**Files:**
- Create: `lib/seo-automation-types.ts`
- Modify: `lib/admin-api.ts`

- [ ] Add typed client helpers for every new admin screen and product SEO generation flow.

### Task 6: Add Admin SEO Automation Pages

**Files:**
- Create: `app/admin/seo/automation/page.tsx`
- Create: `app/admin/seo/issues/page.tsx`
- Create: `app/admin/seo/opportunities/page.tsx`
- Create: `app/admin/seo/recommendations/page.tsx`
- Create: `app/admin/seo/content-pipeline/page.tsx`
- Create: `app/admin/seo/internal-links/page.tsx`
- Create: `app/admin/seo/change-log/page.tsx`
- Create: `components/admin/admin-seo-automation-page.tsx`
- Create: `components/admin/admin-seo-issues-page.tsx`
- Create: `components/admin/admin-seo-opportunities-page.tsx`
- Create: `components/admin/admin-seo-recommendations-page.tsx`
- Create: `components/admin/admin-seo-content-pipeline-page.tsx`
- Create: `components/admin/admin-seo-internal-links-page.tsx`
- Create: `components/admin/admin-seo-change-log-page.tsx`
- Modify: `components/admin/admin-seo-nav.tsx`

- [ ] Build table-driven admin pages with status/priority/type filters and manual actions.

### Task 7: Add Product SEO Draft Generation UI

**Files:**
- Modify: `components/admin/admin-product-editor.tsx`

- [ ] Add draft generation controls and manual apply behavior inside the SEO tab.

### Task 8: Update README And Verify

**Files:**
- Modify: `README.md`

- [ ] Document GSC, GA4, SEO automation, and cron job configuration.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
