# Admin Content Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a database-backed admin content module for guides and FAQs, import existing guides into the CMS, and switch storefront guide pages and sitemap to published database content.

**Architecture:** Add a shared `ContentEntry` content header model plus guide/FAQ detail models in Prisma, then implement one backend module that owns admin CRUD, publish state transitions, storefront read queries, and bootstrap import. On the frontend, add admin guide and FAQ pages that talk to the API, then swap `/guides`, `/guides/[slug]`, and `app/sitemap.ts` to database-backed published guides while keeping preview and status handling isolated to admin routes.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, NestJS, Prisma, Jest

---

## File Structure

- Create: `api/src/admin-content/admin-content.module.ts`
- Create: `api/src/admin-content/admin-content.controller.ts`
- Create: `api/src/admin-content/admin-content.service.ts`
- Create: `api/src/admin-content/admin-content.storefront.service.ts`
- Create: `api/src/admin-content/admin-content.types.ts`
- Create: `api/src/admin-content/dto/upsert-guide.dto.ts`
- Create: `api/src/admin-content/dto/update-faq.dto.ts`
- Create: `api/src/admin-content/admin-content.service.spec.ts`
- Create: `api/prisma/migrations/0005_content_management_cms/migration.sql`
- Modify: `api/prisma/schema.prisma`
- Modify: `api/prisma/seed.ts`
- Create: `lib/admin-content-types.ts`
- Modify: `lib/admin-api.ts`
- Create: `lib/content-api.ts`
- Create: `lib/content-types.ts`
- Create: `components/admin/admin-guides-page.tsx`
- Create: `components/admin/admin-guide-editor.tsx`
- Create: `components/admin/admin-guide-preview.tsx`
- Create: `components/admin/admin-faq-page.tsx`
- Create: `components/admin/content-status-badge.tsx`
- Create: `components/admin/repeatable-list-editor.tsx`
- Modify: `app/admin/content/page.tsx`
- Create: `app/admin/content/guides/page.tsx`
- Create: `app/admin/content/guides/new/page.tsx`
- Create: `app/admin/content/guides/[id]/page.tsx`
- Create: `app/admin/content/faq/page.tsx`
- Modify: `app/guides/page.tsx`
- Modify: `app/guides/[slug]/page.tsx`
- Modify: `app/sitemap.ts`

### Task 1: Define Prisma Content Models

**Files:**
- Modify: `api/prisma/schema.prisma`
- Create: `api/prisma/migrations/0005_content_management_cms/migration.sql`

- [ ] **Step 1: Write the failing Prisma-dependent backend test**

Add a new failing test in `api/src/admin-content/admin-content.service.spec.ts` that constructs a guide payload and expects `createGuide()` to persist a `ContentEntry` with `type = GUIDE`, `status = DRAFT`, and a related `GuideContent` record.

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `npm --prefix api test -- admin-content.service.spec.ts`
Expected: FAIL because `admin-content` service and Prisma content models do not exist yet.

- [ ] **Step 3: Add minimal content enums and Prisma models**

Update `api/prisma/schema.prisma` to add:

```prisma
enum ContentType {
  GUIDE
  FAQ
  COLLECTION_PAGE
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

Add:

```prisma
model ContentEntry {
  id             String          @id @default(cuid())
  type           ContentType
  title          String
  slug           String
  status         ContentStatus   @default(DRAFT)
  seoTitle       String?
  seoDescription String?
  publishedAt    DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  guideContent   GuideContent?
  faqContent     FaqContent?

  @@index([type, status])
  @@unique([type, slug])
}
```

Add `GuideContent`, `FaqContent`, and `CollectionLandingContent` as one-to-one detail models keyed by `entryId`.

- [ ] **Step 4: Write the SQL migration**

Create `api/prisma/migrations/0005_content_management_cms/migration.sql` for the new enums, tables, unique constraints, and indexes.

- [ ] **Step 5: Generate Prisma client and re-run the test**

Run:
- `npm --prefix api run prisma:generate`
- `npm --prefix api test -- admin-content.service.spec.ts`

Expected: FAIL later in service implementation, not on missing Prisma types.

### Task 2: Build Admin Content Service with Audit Logging

**Files:**
- Create: `api/src/admin-content/admin-content.module.ts`
- Create: `api/src/admin-content/admin-content.controller.ts`
- Create: `api/src/admin-content/admin-content.service.ts`
- Create: `api/src/admin-content/admin-content.types.ts`
- Create: `api/src/admin-content/dto/upsert-guide.dto.ts`
- Create: `api/src/admin-content/dto/update-faq.dto.ts`
- Modify: `api/src/admin-content/admin-content.service.spec.ts`

- [ ] **Step 1: Expand the failing test suite**

Add failing tests for:
- `createGuide()` writes `CONTENT_CREATED`
- `updateGuide()` writes `CONTENT_UPDATED`
- `publishGuide()` sets `status = PUBLISHED`, sets `publishedAt`, and writes `CONTENT_PUBLISHED`
- `archiveGuide()` writes `CONTENT_ARCHIVED`
- `moveGuideToDraft()` writes `CONTENT_DRAFTED`
- `updateFaq()` writes `FAQ_UPDATED`

- [ ] **Step 2: Run the targeted test to verify red**

Run: `npm --prefix api test -- admin-content.service.spec.ts`
Expected: FAIL with missing methods and module imports.

- [ ] **Step 3: Implement minimal DTOs and service methods**

Create a focused service API:

```ts
createGuide(actorId: string, input: UpsertGuideDto)
updateGuide(id: string, actorId: string, input: UpsertGuideDto)
publishGuide(id: string, actorId: string)
archiveGuide(id: string, actorId: string)
moveGuideToDraft(id: string, actorId: string)
listGuides(status?: ContentStatus)
getGuideById(id: string)
updateFaq(actorId: string, input: UpdateFaqDto)
getFaq()
```

Use Prisma transactions and mirror the existing `auditLog.create()` shape from `api/src/admin-products/admin-products.service.ts`.

- [ ] **Step 4: Add controller routes and role guards**

Expose:
- `GET /admin/content/guides`
- `POST /admin/content/guides`
- `GET /admin/content/guides/:id`
- `PATCH /admin/content/guides/:id`
- `POST /admin/content/guides/:id/publish`
- `POST /admin/content/guides/:id/archive`
- `POST /admin/content/guides/:id/draft`
- `GET /admin/content/faq`
- `PUT /admin/content/faq`

Guard with `@AdminRoles("CONTENT_EDITOR", "ADMIN", "SUPER_ADMIN")`.

- [ ] **Step 5: Re-run the service test**

Run: `npm --prefix api test -- admin-content.service.spec.ts`
Expected: PASS for service-level behavior.

### Task 3: Import Existing Guides and Add Storefront Read Service

**Files:**
- Create: `api/src/admin-content/admin-content.storefront.service.ts`
- Modify: `api/prisma/seed.ts`
- Modify: `api/src/admin-content/admin-content.service.spec.ts`

- [ ] **Step 1: Add failing tests for import and storefront reads**

Add tests for:
- `importGuidesFromStaticData()` creates published guides from `data/guides.ts` when no guide entries exist
- import is idempotent
- `listPublishedGuides()` returns only `PUBLISHED` guides
- `getPublishedGuideBySlug()` ignores draft and archived records

- [ ] **Step 2: Run tests to verify red**

Run: `npm --prefix api test -- admin-content.service.spec.ts`
Expected: FAIL on missing import/storefront methods.

- [ ] **Step 3: Implement import and storefront query methods**

Create one importer that maps:
- `metaTitle -> seoTitle`
- `metaDescription -> seoDescription`
- `author.name -> authorName`
- `author.role -> authorRole`

Store `sections`, `faq`, `relatedProducts`, `relatedCollections`, and `relatedGuides` in JSON fields.

- [ ] **Step 4: Hook the import into seed/bootstrap**

In `api/prisma/seed.ts`, after admin/product setup, import guides only when no `GUIDE` entries exist. Seed the FAQ root entry if it does not exist.

- [ ] **Step 5: Re-run tests**

Run: `npm --prefix api test -- admin-content.service.spec.ts`
Expected: PASS with import/storefront behavior covered.

### Task 4: Add Admin Content UI and API Client Types

**Files:**
- Create: `lib/admin-content-types.ts`
- Modify: `lib/admin-api.ts`
- Create: `components/admin/admin-guides-page.tsx`
- Create: `components/admin/admin-guide-editor.tsx`
- Create: `components/admin/admin-guide-preview.tsx`
- Create: `components/admin/admin-faq-page.tsx`
- Create: `components/admin/content-status-badge.tsx`
- Create: `components/admin/repeatable-list-editor.tsx`
- Modify: `app/admin/content/page.tsx`
- Create: `app/admin/content/guides/page.tsx`
- Create: `app/admin/content/guides/new/page.tsx`
- Create: `app/admin/content/guides/[id]/page.tsx`
- Create: `app/admin/content/faq/page.tsx`

- [ ] **Step 1: Add a small failing render/build check**

Create the route files with imports that reference not-yet-created admin content components, then run the frontend build.

- [ ] **Step 2: Run build to confirm red**

Run: `npm run build`
Expected: FAIL with missing admin content components/types.

- [ ] **Step 3: Implement minimal admin content pages**

Build:
- guide list with status filter and create CTA
- new guide page with empty editor
- edit guide page with save/publish/archive/draft actions and preview panel
- FAQ page with repeatable question/answer rows

Keep the editor structured and lightweight:

```ts
type GuideEditorState = {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  dek: string;
  category: string;
  authorName: string;
  authorRole: string;
  readTime: string;
  sections: Array<{ heading: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
  relatedProducts: string[];
  relatedCollections: Array<{ title: string; path: string }>;
  relatedGuides: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};
```

- [ ] **Step 4: Re-run the build**

Run: `npm run build`
Expected: proceed past missing page/component errors.

### Task 5: Switch Storefront Guides and Sitemap to Database Content

**Files:**
- Create: `lib/content-api.ts`
- Create: `lib/content-types.ts`
- Modify: `app/guides/page.tsx`
- Modify: `app/guides/[slug]/page.tsx`
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Add a failing storefront test or build-driven red check**

Update `app/guides/page.tsx` and `app/guides/[slug]/page.tsx` to reference database-backed fetch helpers that do not exist yet.

- [ ] **Step 2: Run build to verify red**

Run: `npm run build`
Expected: FAIL because content fetchers/types are missing.

- [ ] **Step 3: Implement storefront fetchers and route updates**

Create `lib/content-api.ts` helpers:
- `getPublishedGuides()`
- `getPublishedGuideBySlug(slug: string)`

Then:
- use DB-backed data in `/guides`
- use DB-backed data plus `notFound()` in `/guides/[slug]`
- update `generateMetadata()` and JSON-LD input mapping
- update `app/sitemap.ts` to include only published guide entries

- [ ] **Step 4: Re-run the build**

Run: `npm run build`
Expected: PASS for storefront guide routes.

### Task 6: Final Verification

**Files:**
- Review only

- [ ] **Step 1: Run API content tests**

Run: `npm --prefix api test -- admin-content.service.spec.ts`
Expected: PASS

- [ ] **Step 2: Run API build**

Run: `npm --prefix api run build`
Expected: PASS

- [ ] **Step 3: Run frontend lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Run frontend build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Spot-check acceptance criteria**

Verify:
- admin can create a guide
- `/guides/[slug]` shows published DB content
- draft guide does not appear in sitemap
- published guide appears in sitemap
