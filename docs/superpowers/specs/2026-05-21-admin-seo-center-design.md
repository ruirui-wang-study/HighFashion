# Admin SEO Center Design

## Summary

Build a dedicated admin SEO Center for PulseGear with three routes:

- `/admin/seo`
- `/admin/seo/pages`
- `/admin/seo/queries`

The center combines two data domains:

- search performance data shaped like Google Search Console
- local SEO health analysis derived from the current site and content rules

In this phase, Search Console is not connected. The system must use mock fallback data and clearly display `Not Connected`. The implementation must also include a Search Console sync service skeleton so a real adapter can be added later without reworking the admin UI.

## Goals

- Provide an SEO overview page with search-performance style metrics.
- Provide page-level SEO diagnostics with a visible health score.
- Provide query-level SEO reporting with mock fallback data.
- Keep the architecture ready for future Search Console API integration.
- Preserve the existing product SEO coverage work by folding it into the new center where appropriate.
- Pass `npm run build`.

## Non-Goals

- Real Google Search Console authentication or sync in this phase.
- Historical storage or cron-based ingestion.
- Bulk SEO editing workflows.

## Routes

### Frontend

- `/admin/seo`
- `/admin/seo/pages`
- `/admin/seo/queries`

### Backend

- `/api/admin/seo/overview?days=7`
- `/api/admin/seo/pages?days=7`
- `/api/admin/seo/queries?days=7`

## Data Domains

### Search Console style metrics

Used for:

- organic clicks
- impressions
- CTR
- average position
- top queries
- top pages
- pages losing traffic
- query dimensions like country and device

Current implementation source:

- mock fallback provider

Every response must include:

- `searchConsole.connected = false`
- `searchConsole.status = "Not Connected"`

### Local SEO health analysis

Used for:

- page title presence
- meta description presence
- canonical presence
- image alt coverage
- sitemap inclusion
- structured data presence
- page-level SEO health score

Current implementation source:

- local page and content analysis

## Page Scope

The `/admin/seo/pages` dataset should cover managed public pages, not just products. First phase coverage:

- product detail pages
- guide pages
- collection landing pages

Optional later expansion:

- static marketing pages

## Health Rules

SEO health checks:

- missing title
- missing description
- missing canonical
- missing alt text
- not in sitemap
- no structured data

### Health score

Use a 100-point score with rule-based deductions. The exact deductions can be tuned later, but this phase should keep them deterministic and transparent.

Suggested first-pass scoring:

- missing title: -25
- missing description: -20
- missing canonical: -15
- missing alt text: -15
- not in sitemap: -10
- no structured data: -15

Floor at `0`, cap at `100`.

## Page Design

### `/admin/seo`

Show:

- organic clicks
- impressions
- CTR
- average position
- top queries
- top pages
- pages losing traffic
- health summary
- Search Console connection badge

This route is the SEO overview and should combine search-performance and health context.

### `/admin/seo/pages`

Show:

- URL
- title
- description
- canonical
- index status
- clicks
- impressions
- CTR
- position
- SEO health score

Also surface page-level SEO issues in a compact, scannable way.

### `/admin/seo/queries`

Show:

- query
- clicks
- impressions
- CTR
- position
- landing page
- country
- device

This page is query-first and should stay resilient when Search Console is disconnected by rendering mock fallback rows.

## Backend Design

### New module

Add a dedicated `admin-seo` Nest module with:

- controller
- service
- Search Console provider interface
- mock Search Console provider
- Search Console sync service skeleton
- SEO health analysis service
- DTO for time range

### Search Console sync skeleton

The sync service should:

- expose a clear provider boundary
- detect whether Search Console is configured
- return mock fallback data when not configured
- be shaped so a future Google API adapter can replace the mock provider without changing controllers or page components

### SEO health analysis service

This service should:

- enumerate managed public pages
- inspect metadata inputs
- infer sitemap inclusion from route/page datasets
- determine whether structured data exists for that page type
- compute issue flags and health score

## Frontend Design

Reuse the existing admin page patterns and analytics-style shared UI where practical.

New page components:

- `components/admin/admin-seo-overview-page.tsx`
- `components/admin/admin-seo-pages-page.tsx`
- `components/admin/admin-seo-queries-page.tsx`

Shared UI components:

- `admin-search-console-badge`
- `admin-seo-health-badge`
- `admin-seo-health-score`

Prefer lightweight tables and panels. Do not add a heavyweight chart dependency.

## Connection Behavior

When Search Console is not configured:

- pages still render successfully
- mock data is returned for performance metrics
- connection state is visible as `Not Connected`
- local health analysis remains real

## Access Control

SEO Center remains behind current SEO/content admin permissions.

Suggested behavior:

- `/admin/seo*` should allow `CONTENT_EDITOR`
- `SUPER_ADMIN` and `ADMIN` inherit via existing role logic

## Testing

### Backend

Add service tests for:

- mock Search Console fallback
- overview payload shape
- page health score calculation
- sitemap inclusion detection
- structured data detection

### Frontend

Verify:

- overview, pages, and queries routes build correctly
- `Not Connected` renders without errors
- health score is visible in page tables

### Final verification

Run:

- `npm run build`

Recommended:

- `npm run lint`
- relevant API tests/build if backend changes are added

## Implementation Plan Direction

1. Add backend `admin-seo` contracts, provider skeleton, and health analysis.
2. Add frontend SEO Center types and fetch helpers.
3. Implement overview, pages, and queries routes.
4. Merge or replace the current `/admin/seo` product-only surface with the new SEO overview.
5. Verify mock fallback, health scores, and build stability.
