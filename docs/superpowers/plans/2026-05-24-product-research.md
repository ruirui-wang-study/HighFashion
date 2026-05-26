# Product Research Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full admin-only AI Product Research system with candidate ingestion, supplier management, real-signal collection, deterministic scoring, risk review, test launch tracking, human decisions, and conversion into `Product` drafts only.

**Architecture:** Add a dedicated `product-research` backend module and admin route tree aligned with the existing `admin-products` and `seo-automation` patterns. Separate the domain into candidate, import, supplier, signal, scoring, risk, test-launch, decision, and convert services, while keeping AI and external market inputs behind provider interfaces so the workflow remains stable even when some providers are unconfigured or unavailable.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, NestJS, Prisma, PostgreSQL, Jest, ESLint, OpenAI API, Google APIs

---

## File Structure

### Backend

- Create: `api/src/product-research/product-research.module.ts`
- Create: `api/src/product-research/product-research.controller.ts`
- Create: `api/src/product-research/product-research.types.ts`
- Create: `api/src/product-research/product-research.mapper.ts`
- Create: `api/src/product-research/product-research.service.ts`
- Create: `api/src/product-research/services/candidate.service.ts`
- Create: `api/src/product-research/services/import.service.ts`
- Create: `api/src/product-research/services/supplier.service.ts`
- Create: `api/src/product-research/services/signal.service.ts`
- Create: `api/src/product-research/services/scoring.service.ts`
- Create: `api/src/product-research/services/risk.service.ts`
- Create: `api/src/product-research/services/test-launch.service.ts`
- Create: `api/src/product-research/services/decision.service.ts`
- Create: `api/src/product-research/services/convert.service.ts`
- Create: `api/src/product-research/providers/ai/ai-research.provider.ts`
- Create: `api/src/product-research/providers/ai/openai-research.provider.ts`
- Create: `api/src/product-research/providers/signals/market-signal.provider.ts`
- Create: `api/src/product-research/providers/signals/google-trends.provider.ts`
- Create: `api/src/product-research/providers/signals/gsc-signal.provider.ts`
- Create: `api/src/product-research/providers/signals/ga4-signal.provider.ts`
- Create: `api/src/product-research/providers/signals/etsy-signal.provider.ts`
- Create: `api/src/product-research/providers/signals/tiktok-signal.provider.ts`
- Create: `api/src/product-research/providers/suppliers/supplier-enrichment.provider.ts`
- Create: `api/src/product-research/providers/suppliers/alibaba-link.provider.ts`
- Create: `api/src/product-research/dto/*.ts`
- Create: `api/src/product-research/*.spec.ts`
- Modify: `api/src/app.module.ts`
- Modify: `api/prisma/schema.prisma`
- Create: `api/prisma/migrations/0010_product_research/migration.sql`

### Frontend

- Create: `app/admin/product-research/dashboard/page.tsx`
- Create: `app/admin/product-research/candidates/page.tsx`
- Create: `app/admin/product-research/candidates/new/page.tsx`
- Create: `app/admin/product-research/candidates/[id]/page.tsx`
- Create: `app/admin/product-research/import/page.tsx`
- Create: `app/admin/product-research/import/ai/page.tsx`
- Create: `app/admin/product-research/import/csv/page.tsx`
- Create: `app/admin/product-research/import/alibaba-links/page.tsx`
- Create: `app/admin/product-research/import/batches/page.tsx`
- Create: `app/admin/product-research/suppliers/page.tsx`
- Create: `app/admin/product-research/scoring-rules/page.tsx`
- Create: `app/admin/product-research/risk-review/page.tsx`
- Create: `app/admin/product-research/test-launches/page.tsx`
- Create: `app/admin/product-research/decisions/page.tsx`
- Create: `components/admin/admin-product-research-nav.tsx`
- Create: `components/admin/admin-product-research-dashboard-page.tsx`
- Create: `components/admin/admin-product-research-candidates-page.tsx`
- Create: `components/admin/admin-product-research-candidate-detail-page.tsx`
- Create: `components/admin/admin-product-research-import-page.tsx`
- Create: `components/admin/admin-product-research-ai-import-page.tsx`
- Create: `components/admin/admin-product-research-csv-import-page.tsx`
- Create: `components/admin/admin-product-research-alibaba-import-page.tsx`
- Create: `components/admin/admin-product-research-import-batches-page.tsx`
- Create: `components/admin/admin-product-research-suppliers-page.tsx`
- Create: `components/admin/admin-product-research-scoring-rules-page.tsx`
- Create: `components/admin/admin-product-research-risk-review-page.tsx`
- Create: `components/admin/admin-product-research-test-launches-page.tsx`
- Create: `components/admin/admin-product-research-decisions-page.tsx`
- Create: `components/admin/product-research-score-radar.tsx`
- Create: `components/admin/product-research-risk-badge.tsx`
- Create: `components/admin/product-research-recommended-action-badge.tsx`
- Create: `components/admin/product-research-confirm-dialog.tsx`
- Modify: `components/admin/admin-sidebar.tsx`
- Modify: `lib/admin-rbac.ts`
- Create: `lib/product-research-types.ts`
- Modify: `lib/admin-api.ts`

### Documentation

- Modify: `README.md`
- Create: `docs/product-research-import-template-candidates.csv`
- Create: `docs/product-research-import-template-supplier-quotes.csv`

---

### Task 1: Add Prisma Product Research Enums And Models

**Files:**
- Modify: `api/prisma/schema.prisma`
- Create: `api/prisma/migrations/0010_product_research/migration.sql`

- [ ] **Step 1: Add failing schema snapshot expectations**

Document the intended enums and models in comments or local notes before editing:

- `ProductCandidateSource`
- `ProductCandidateStatus`
- `ProductResearchRecommendedAction`
- `SupplierPlatform`
- `ProductResearchSignalSource`
- `ProductTestLaunchStatus`
- `ProductResearchDecisionType`
- `ProductResearchImportSource`
- `ProductResearchRiskSeverity`
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

- [ ] **Step 2: Modify Prisma schema**

Add the enums and models from the spec, including:

- foreign keys to `AdminUser` for creator/operator fields where needed
- indexes for candidate list filters
- relation names where ambiguity would otherwise exist
- `convertedProductId` optional field on `ProductCandidate`

- [ ] **Step 3: Add migration SQL**

Generate or hand-write the migration SQL so it:

- creates all new enums
- creates all new tables
- creates indexes for:
  - candidate search/status/source/market
  - supplier URL
  - signals by candidate/source
  - test launches by candidate/status
  - decisions by candidate/date
  - risk flags by candidate/severity

- [ ] **Step 4: Run Prisma schema validation**

Run: `cmd /c npm --prefix api run prisma:generate`

Expected: Prisma client generation succeeds

- [ ] **Step 5: Commit**

```bash
git add api/prisma/schema.prisma api/prisma/migrations/0010_product_research
git commit -m "feat: add product research schema"
```

### Task 2: Add Product Research Domain Types And Mapper Tests

**Files:**
- Create: `api/src/product-research/product-research.types.ts`
- Create: `api/src/product-research/product-research.mapper.ts`
- Create: `api/src/product-research/product-research.mapper.spec.ts`

- [ ] **Step 1: Write failing mapper tests**

Cover:

- candidate list mapping
- candidate detail mapping
- latest score projection
- recommended action badge mapping
- risk severity rollup

- [ ] **Step 2: Run test to verify failure**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/product-research.mapper.spec.ts`

Expected: FAIL because files and exports do not exist

- [ ] **Step 3: Implement domain types and mapper**

Add:

- frontend-safe API record shapes
- mapper helpers for score snapshots
- mapper helpers for supplier quote comparison

- [ ] **Step 4: Re-run tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/product-research.mapper.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/src/product-research/product-research.types.ts api/src/product-research/product-research.mapper.ts api/src/product-research/product-research.mapper.spec.ts
git commit -m "feat: add product research mapping layer"
```

### Task 3: Scaffold Backend Module, DTOs, And Route Surface

**Files:**
- Create: `api/src/product-research/product-research.module.ts`
- Create: `api/src/product-research/product-research.controller.ts`
- Create: `api/src/product-research/dto/*.ts`
- Modify: `api/src/app.module.ts`
- Create: `api/src/product-research/product-research.controller.spec.ts`

- [ ] **Step 1: Write failing controller tests**

Cover:

- route registration for dashboard, candidates, imports, suppliers, rules, tests, and decisions
- guard usage and role restrictions for:
  - import commit
  - scoring rule activation
  - convert-to-product

- [ ] **Step 2: Run test to verify failure**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/product-research.controller.spec.ts`

Expected: FAIL because module/controller do not exist

- [ ] **Step 3: Implement minimal DTOs and controller stubs**

Define DTOs for:

- candidate query filters
- AI preview request
- CSV preview commit payloads
- supplier quote updates
- score manual adjustment
- decision creation
- test launch upsert

- [ ] **Step 4: Register module in app**

Import the new module in `api/src/app.module.ts`

- [ ] **Step 5: Re-run tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/product-research.controller.spec.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add api/src/product-research api/src/app.module.ts
git commit -m "feat: scaffold product research module"
```

### Task 4: Implement Candidate, Supplier, And Decision Core Services

**Files:**
- Create: `api/src/product-research/services/candidate.service.ts`
- Create: `api/src/product-research/services/supplier.service.ts`
- Create: `api/src/product-research/services/decision.service.ts`
- Create: `api/src/product-research/services/candidate.service.spec.ts`
- Create: `api/src/product-research/services/decision.service.spec.ts`

- [ ] **Step 1: Write failing service tests**

Cover:

- candidate create and list filters
- supplier linking and quote updates
- decision persistence
- approval and rejection transitions
- audit log writes for create and decision actions

- [ ] **Step 2: Run tests to verify failure**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/candidate.service.spec.ts src/product-research/services/decision.service.spec.ts`

Expected: FAIL

- [ ] **Step 3: Implement candidate service**

Support:

- candidate CRUD
- candidate list query filters
- latest score and risk rollup
- possible duplicate reference handling

- [ ] **Step 4: Implement supplier service**

Support:

- supplier CRUD
- candidate-to-supplier links
- quote field updates

- [ ] **Step 5: Implement decision service**

Support:

- record manual decisions
- state transitions
- `AuditLog` + `ProductResearchDecision`

- [ ] **Step 6: Re-run tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/candidate.service.spec.ts src/product-research/services/decision.service.spec.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add api/src/product-research/services
git commit -m "feat: add product research candidate and decision services"
```

### Task 5: Implement Import Batch Flow And Deduplication

**Files:**
- Create: `api/src/product-research/services/import.service.ts`
- Create: `api/src/product-research/services/import.service.spec.ts`
- Modify: `api/src/product-research/product-research.controller.ts`

- [ ] **Step 1: Write failing import tests**

Cover:

- AI preview returns draft candidates only
- AI commit creates selected candidates and import batch
- candidate CSV preview validates required columns
- supplier quote CSV preview validates quote fields
- Alibaba links preview creates structured preview rows
- exact duplicate by `supplier_url`
- possible duplicate by `productName + category + targetMarket`

- [ ] **Step 2: Run tests to verify failure**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/import.service.spec.ts`

Expected: FAIL

- [ ] **Step 3: Implement import parsing helpers**

Support:

- candidate CSV row normalization
- supplier quote CSV normalization
- Alibaba link list parsing
- duplicate classification
- import batch summary building

- [ ] **Step 4: Implement AI preview/commit flow**

Preview:

- no writes to candidate tables
- returns `AI Draft` rows

Commit:

- creates candidates
- creates import batch
- writes `AuditLog`

- [ ] **Step 5: Re-run tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/import.service.spec.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add api/src/product-research/services/import.service.ts api/src/product-research/services/import.service.spec.ts api/src/product-research/product-research.controller.ts
git commit -m "feat: add product research import workflows"
```

### Task 6: Implement Provider Interfaces And OpenAI/Alibaba Adapters

**Files:**
- Create: `api/src/product-research/providers/ai/ai-research.provider.ts`
- Create: `api/src/product-research/providers/ai/openai-research.provider.ts`
- Create: `api/src/product-research/providers/suppliers/supplier-enrichment.provider.ts`
- Create: `api/src/product-research/providers/suppliers/alibaba-link.provider.ts`
- Create: `api/src/product-research/providers/providers.spec.ts`

- [ ] **Step 1: Write failing provider tests**

Cover:

- OpenAI prompt shaping for candidate generation
- OpenAI output parsing into candidate previews
- Alibaba link provider returns normalized source URL and text-derived metadata
- provider failure surfaces safe typed errors

- [ ] **Step 2: Run tests to verify failure**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/providers/providers.spec.ts`

Expected: FAIL

- [ ] **Step 3: Implement provider interfaces**

Define:

- AI generation request/response contracts
- supplier enrichment contracts

- [ ] **Step 4: Implement OpenAI provider**

Support:

- candidate generation
- scoring reasoning generation
- draft copy generation

Use environment variables:

- `OPENAI_API_KEY`
- model selectors

- [ ] **Step 5: Implement Alibaba link provider**

MVP behavior:

- parse links and identifiers
- infer supplier platform/source metadata
- do not require full HTML scraping

- [ ] **Step 6: Re-run tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/providers/providers.spec.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add api/src/product-research/providers
git commit -m "feat: add product research AI and supplier providers"
```

### Task 7: Implement Real Market Signal Providers

**Files:**
- Create: `api/src/product-research/providers/signals/market-signal.provider.ts`
- Create: `api/src/product-research/providers/signals/google-trends.provider.ts`
- Create: `api/src/product-research/providers/signals/gsc-signal.provider.ts`
- Create: `api/src/product-research/providers/signals/ga4-signal.provider.ts`
- Create: `api/src/product-research/providers/signals/etsy-signal.provider.ts`
- Create: `api/src/product-research/providers/signals/tiktok-signal.provider.ts`
- Create: `api/src/product-research/providers/signals/signals.spec.ts`

- [ ] **Step 1: Write failing signal provider tests**

Cover:

- trends fetch normalization
- GSC query signal mapping
- GA4 funnel/test metric mapping
- Etsy API response normalization
- TikTok API response normalization
- unconfigured providers return explicit unavailable states

- [ ] **Step 2: Run tests to verify failure**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/providers/signals/signals.spec.ts`

Expected: FAIL

- [ ] **Step 3: Implement provider base interface**

Each provider should return:

- normalized metrics
- raw provider data
- collected timestamp
- availability state

- [ ] **Step 4: Implement Google Trends provider**

Support alpha-style availability check and normalized trend scores.

- [ ] **Step 5: Implement GSC and GA4 providers**

Reuse existing credential conventions from the current SEO modules.

- [ ] **Step 6: Implement Etsy and TikTok providers**

Scope first implementation to read/search use cases needed for research scoring.

- [ ] **Step 7: Re-run tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/providers/signals/signals.spec.ts`

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add api/src/product-research/providers/signals
git commit -m "feat: add product research market signal providers"
```

### Task 8: Implement Signal Collection, Scoring, And Risk Engines

**Files:**
- Create: `api/src/product-research/services/signal.service.ts`
- Create: `api/src/product-research/services/scoring.service.ts`
- Create: `api/src/product-research/services/risk.service.ts`
- Create: `api/src/product-research/services/scoring.service.spec.ts`
- Create: `api/src/product-research/services/risk.service.spec.ts`

- [ ] **Step 1: Write failing scoring and risk tests**

Cover:

- `finalScore` calculation from the active scoring rule
- `riskInverseScore = 100 - riskScore`
- `recommendedAction` assignment
- `HIGH_RISK_REVIEW` override on `riskScore >= 70`
- hard gate keyword generation of `BLOCKING` flags
- manual score adjustment with reason

- [ ] **Step 2: Run tests to verify failure**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/scoring.service.spec.ts src/product-research/services/risk.service.spec.ts`

Expected: FAIL

- [ ] **Step 3: Implement signal service**

Support:

- collect from configured providers
- persist `ProductResearchSignal`
- upsert or append provider metrics safely

- [ ] **Step 4: Implement scoring service**

Support:

- rule lookup from active `ScoringRule`
- AI reasoning injection
- deterministic numeric formula
- score persistence
- candidate score snapshot updates

- [ ] **Step 5: Implement risk service**

Support:

- keyword risk detection
- hard gate category rules
- severity classification
- blocking convert checks

- [ ] **Step 6: Re-run tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/scoring.service.spec.ts src/product-research/services/risk.service.spec.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add api/src/product-research/services/signal.service.ts api/src/product-research/services/scoring.service.ts api/src/product-research/services/risk.service.ts api/src/product-research/services/*.spec.ts
git commit -m "feat: add product research scoring and risk engines"
```

### Task 9: Implement Test Launches And Validated Score Calculation

**Files:**
- Create: `api/src/product-research/services/test-launch.service.ts`
- Create: `api/src/product-research/services/test-launch.service.spec.ts`
- Modify: `api/src/product-research/product-research.controller.ts`

- [ ] **Step 1: Write failing test launch tests**

Cover:

- create planned launch
- update running metrics
- compute `testScore`
- compute `validatedScore = initial*0.6 + test*0.4`
- recommendation updates after completed test

- [ ] **Step 2: Run tests to verify failure**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/test-launch.service.spec.ts`

Expected: FAIL

- [ ] **Step 3: Implement test launch service**

Support:

- planned/running/completed/stopped states
- score recalculation
- candidate validated score update
- audit writes

- [ ] **Step 4: Re-run tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/test-launch.service.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/src/product-research/services/test-launch.service.ts api/src/product-research/services/test-launch.service.spec.ts api/src/product-research/product-research.controller.ts
git commit -m "feat: add product research test launch tracking"
```

### Task 10: Implement Convert-To-Product Draft Flow

**Files:**
- Create: `api/src/product-research/services/convert.service.ts`
- Create: `api/src/product-research/services/convert.service.spec.ts`
- Modify: `api/src/products/products.service.ts` or create focused helper if cleaner

- [ ] **Step 1: Write failing convert tests**

Cover:

- only `APPROVED` candidates can convert
- blocking risk prevents conversion
- conversion creates `Product.status = DRAFT`
- supplier images are not imported
- audit and decision records are written

- [ ] **Step 2: Run tests to verify failure**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/convert.service.spec.ts`

Expected: FAIL

- [ ] **Step 3: Implement conversion service**

Map:

- candidate name -> product title
- normalized title -> slug
- AI draft summary -> short description
- AI draft body -> description
- AI SEO draft -> SEO title/description
- AI benefits/features/FAQ -> product arrays or candidate payload carryover

- [ ] **Step 4: Re-run tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research/services/convert.service.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/src/product-research/services/convert.service.ts api/src/product-research/services/convert.service.spec.ts
git commit -m "feat: add product research convert-to-product flow"
```

### Task 11: Add Frontend Types And Admin API Helpers

**Files:**
- Create: `lib/product-research-types.ts`
- Modify: `lib/admin-api.ts`

- [ ] **Step 1: Add typed records**

Define frontend types for:

- dashboard summary
- candidate list row
- candidate detail tabs
- score cards
- supplier quotes
- risk flags
- test launch records
- import preview rows

- [ ] **Step 2: Add admin API helpers**

Support:

- list/detail fetches
- preview/commit imports
- rescore/risk-check
- create/update candidate
- supplier updates
- test launches
- decisions
- conversion

- [ ] **Step 3: Run frontend typecheck through build**

Run later as part of full frontend build

- [ ] **Step 4: Commit**

```bash
git add lib/product-research-types.ts lib/admin-api.ts
git commit -m "feat: add product research frontend types"
```

### Task 12: Add Admin Navigation And Route Shells

**Files:**
- Modify: `lib/admin-rbac.ts`
- Create: `app/admin/product-research/*/page.tsx`
- Create: `components/admin/admin-product-research-nav.tsx`

- [ ] **Step 1: Add new admin nav item**

Add:

- `/admin/product-research/dashboard`

Roles:

- `VIEWER+`

- [ ] **Step 2: Create route shells**

Each route should render:

- admin shell
- page header
- module nav
- placeholder loading-safe panel

- [ ] **Step 3: Add SEO-safe page titles and layout consistency**

Use existing admin patterns and preserve mobile responsiveness.

- [ ] **Step 4: Commit**

```bash
git add lib/admin-rbac.ts app/admin/product-research components/admin/admin-product-research-nav.tsx
git commit -m "feat: add product research admin routes"
```

### Task 13: Build Dashboard, Candidate List, And Import UIs

**Files:**
- Create: `components/admin/admin-product-research-dashboard-page.tsx`
- Create: `components/admin/admin-product-research-candidates-page.tsx`
- Create: `components/admin/admin-product-research-import-page.tsx`
- Create: `components/admin/admin-product-research-ai-import-page.tsx`
- Create: `components/admin/admin-product-research-csv-import-page.tsx`
- Create: `components/admin/admin-product-research-alibaba-import-page.tsx`
- Create: `components/admin/admin-product-research-import-batches-page.tsx`

- [ ] **Step 1: Build dashboard summary UI**

Include:

- counts
- score summaries
- recent imports
- recent decisions

- [ ] **Step 2: Build candidate list page**

Include:

- search
- filters
- sort
- bulk action placeholders
- risk/action badges

- [ ] **Step 3: Build import pages**

Include:

- AI preview-and-commit flow
- CSV upload/preview/commit flow
- Alibaba links preview/commit flow
- batch history

- [ ] **Step 4: Add confirmation modals where commit actions are destructive or consequential**

- [ ] **Step 5: Commit**

```bash
git add components/admin/admin-product-research-dashboard-page.tsx components/admin/admin-product-research-candidates-page.tsx components/admin/admin-product-research-import*.tsx
git commit -m "feat: add product research dashboard and import UI"
```

### Task 14: Build Candidate Detail, Supplier, Risk, Score, Test, Rule, And Decision UIs

**Files:**
- Create: `components/admin/admin-product-research-candidate-detail-page.tsx`
- Create: `components/admin/admin-product-research-suppliers-page.tsx`
- Create: `components/admin/admin-product-research-scoring-rules-page.tsx`
- Create: `components/admin/admin-product-research-risk-review-page.tsx`
- Create: `components/admin/admin-product-research-test-launches-page.tsx`
- Create: `components/admin/admin-product-research-decisions-page.tsx`
- Create: `components/admin/product-research-score-radar.tsx`
- Create: `components/admin/product-research-risk-badge.tsx`
- Create: `components/admin/product-research-recommended-action-badge.tsx`
- Create: `components/admin/product-research-confirm-dialog.tsx`

- [ ] **Step 1: Build tabbed candidate detail page**

Tabs:

- Overview
- Scores
- Suppliers
- Market Signals
- Risk Review
- Test Launches
- Decisions
- Notes

- [ ] **Step 2: Add score visualization**

Use radar or progress bars for:

- all 9 dimensions
- final score
- validated score

- [ ] **Step 3: Add supplier and quote management tables**

- [ ] **Step 4: Add risk review queue**

Highlight:

- `HIGH`
- `BLOCKING`
- convert disable states

- [ ] **Step 5: Add scoring rules page**

Allow:

- list versions
- create version
- activate version

- [ ] **Step 6: Add test launch and decision pages**

- [ ] **Step 7: Add confirmation dialogs**

Required for:

- approve
- reject
- convert
- rule activation

- [ ] **Step 8: Commit**

```bash
git add components/admin/admin-product-research-* components/admin/product-research-*
git commit -m "feat: add product research detail and review UI"
```

### Task 15: Update README, Add Import Templates, And Verify End To End

**Files:**
- Modify: `README.md`
- Create: `docs/product-research-import-template-candidates.csv`
- Create: `docs/product-research-import-template-supplier-quotes.csv`

- [ ] **Step 1: Update README**

Document:

- product research module purpose
- candidate lifecycle
- scoring formula
- risk hard gates
- import sources
- AI preview-before-import rule
- convert-to-product restrictions
- required API registrations
- environment variables

- [ ] **Step 2: Add CSV templates**

Candidate template columns:

- `product_name`
- `chinese_name`
- `category`
- `target_market`
- `target_audience`
- `use_case`
- `alibaba_keywords`
- `notes`

Supplier quote template columns:

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

- [ ] **Step 3: Run targeted API tests**

Run: `cmd /c npm --prefix api test -- --runInBand src/product-research`

Expected: PASS

- [ ] **Step 4: Run API lint**

Run: `cmd /c npm --prefix api run lint`

Expected: PASS

- [ ] **Step 5: Run frontend lint**

Run: `cmd /c npm run lint`

Expected: PASS

- [ ] **Step 6: Run API build**

Run: `cmd /c npm --prefix api run build`

Expected: PASS

- [ ] **Step 7: Run frontend build**

Run: `cmd /c npm run build`

Expected: PASS

- [ ] **Step 8: Manual verification**

Verify:

- AI candidate preview works
- candidate CSV preview and commit work
- supplier quote CSV preview and commit work
- Alibaba links preview and commit work
- duplicate detection appears
- scoring works
- risk flags appear
- test launch score recalculation works
- approved candidate converts to `Product.status = DRAFT`
- blocking-risk candidate cannot convert

- [ ] **Step 9: Commit**

```bash
git add README.md docs/product-research-import-template-candidates.csv docs/product-research-import-template-supplier-quotes.csv
git commit -m "docs: add product research usage and templates"
```
