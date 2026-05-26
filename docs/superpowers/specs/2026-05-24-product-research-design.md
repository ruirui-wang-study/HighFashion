# Product Research Design

## Summary

Build a full admin-only AI Product Research system for PulseGear under:

- `/admin/product-research`

The system is a semi-automated product discovery and selection workflow for the US and UK sports accessories market. It combines:

- AI candidate generation
- structured imports
- supplier quote management
- external market signals
- deterministic scoring
- automated risk review
- test launch tracking
- human decisions
- conversion to `Product` drafts only

This system must not auto-publish products, must not auto-order from suppliers, and must require human review before conversion into a formal product draft.

## Goals

- Generate candidate products from AI prompts with preview-before-import.
- Import candidate and supplier data from CSV.
- Import Alibaba links in batch and enrich them into structured candidate research records.
- Persist suppliers, quotes, market signals, scores, risk flags, test launches, and decisions.
- Score candidates automatically with a versioned scoring model.
- Block unsafe or non-compliant candidates with hard gates and risk flags.
- Support validated post-test scoring.
- Convert only approved candidates into formal `Product` records with `status = DRAFT`.
- Write `AuditLog` records for all critical operations.
- Pass:
  - `npm run lint`
  - `npm run build`
- Update `README.md` with workflow, scoring rules, and import usage.

## Non-Goals

- Automatic publishing of products.
- Automatic ordering from suppliers.
- Automatic inventory or shipping promises.
- Automatic use of supplier images as final product media.
- Fully autonomous market scraping for all sources in phase one.

## Core Principles

- AI may generate candidates, scores, reasons, and draft copy.
- AI may not publish products.
- AI may not place supplier orders.
- AI may not promise inventory or lead time.
- Human review is required before conversion.
- Converted products must always be created as `DRAFT`.
- High-risk products must be visibly flagged.
- Blocking risks must prohibit conversion.
- Every critical review, scoring override, decision, and conversion must write `AuditLog`.

## Routes

### Frontend admin routes

- `/admin/product-research/dashboard`
- `/admin/product-research/candidates`
- `/admin/product-research/candidates/new`
- `/admin/product-research/candidates/[id]`
- `/admin/product-research/import`
- `/admin/product-research/import/ai`
- `/admin/product-research/import/csv`
- `/admin/product-research/import/alibaba-links`
- `/admin/product-research/import/batches`
- `/admin/product-research/suppliers`
- `/admin/product-research/scoring-rules`
- `/admin/product-research/risk-review`
- `/admin/product-research/test-launches`
- `/admin/product-research/decisions`

### Backend admin API routes

Base path:

- `/api/admin/product-research`

Core groups:

- `/dashboard`
- `/candidates`
- `/import/ai/preview`
- `/import/ai/commit`
- `/import/csv/preview`
- `/import/csv/commit`
- `/import/supplier-quotes/preview`
- `/import/supplier-quotes/commit`
- `/import/alibaba-links/preview`
- `/import/alibaba-links/commit`
- `/import/batches`
- `/suppliers`
- `/candidates/:id/signals`
- `/candidates/:id/scores`
- `/candidates/:id/risk-flags`
- `/candidates/:id/test-launches`
- `/candidates/:id/decisions`
- `/scoring-rules`
- `/risk-review`
- `/test-launches`
- `/decisions`

## Data Model

### New enums

```prisma
enum ProductCandidateSource {
  MANUAL
  AI_GENERATED
  CSV
  ALIBABA_LINK
  SUPPLIER_QUOTE
}

enum ProductCandidateStatus {
  NEW
  RESEARCHING
  WATCH
  SAMPLE
  TEST
  APPROVED
  REJECTED
  HIGH_RISK_REVIEW
}

enum ProductResearchRecommendedAction {
  SAMPLE
  TEST
  WATCH
  REJECT
  REVIEW
}

enum SupplierPlatform {
  ALIBABA
  ALIEXPRESS
  CJ_DROPSHIPPING
  AGENT
  OTHER
}

enum ProductResearchSignalSource {
  GOOGLE_TRENDS
  GSC
  GA4
  AMAZON
  ETSY
  TIKTOK
  ALIBABA
  MANUAL
}

enum ProductTestLaunchStatus {
  PLANNED
  RUNNING
  COMPLETED
  STOPPED
}

enum ProductResearchDecisionType {
  SAMPLE
  TEST
  WATCH
  APPROVE
  REJECT
  CONVERT_TO_PRODUCT
}

enum ProductResearchImportSource {
  AI
  CSV
  ALIBABA_LINK
  SUPPLIER_QUOTE
  MANUAL
}

enum ProductResearchRiskSeverity {
  LOW
  MEDIUM
  HIGH
  BLOCKING
}
```

### ProductCandidate

Primary research object.

Core fields:

- `id`
- `productName`
- `chineseName`
- `category`
- `targetMarket`
- `targetAudience`
- `useCase`
- `description`
- `alibabaKeywords`
- `source`
- `sourceUrl`
- `rawImportData`
- `status`
- `recommendedAction`
- `finalScore`
- `riskScore`
- `validatedScore`
- `createdBy`
- `createdAt`
- `updatedAt`

Recommended extra fields:

- `slugSuggestion`
- `brandAngle`
- `positioningSummary`
- `aiDraftPayload`
- `possibleDuplicateOfId`
- `approvedAt`
- `approvedBy`
- `convertedProductId`

Relations:

- `scores`
- `candidateSuppliers`
- `signals`
- `riskFlags`
- `testLaunches`
- `decisions`

### ProductCandidateScore

Stores one scoring run.

- `id`
- `candidateId`
- `marketDemandScore`
- `trendSeasonalityScore`
- `competitionGapScore`
- `marginPotentialScore`
- `logisticsFitScore`
- `brandabilityScore`
- `supplierQualityScore`
- `riskScore`
- `riskInverseScore`
- `testabilityScore`
- `finalScore`
- `scoringVersion`
- `scoreReasonJson`
- `isManualAdjusted`
- `manualAdjustmentReason`
- `createdAt`
- `computedAt`

### Supplier

- `id`
- `platform`
- `name`
- `url`
- `country`
- `verifiedSupplier`
- `tradeAssurance`
- `yearsOnPlatform`
- `responseRate`
- `moq`
- `samplePriceCents`
- `unitPriceCents`
- `customLogoMoq`
- `customPackagingMoq`
- `leadTimeDays`
- `shippingToUSCents`
- `shippingToUKCents`
- `certifications`
- `notes`
- `createdAt`
- `updatedAt`

### ProductCandidateSupplier

Join table for candidate-specific quotes.

- `candidateId`
- `supplierId`
- `quotedUnitPriceCents`
- `quotedMoq`
- `quotedLeadTimeDays`
- `quoteFileUrl`
- `notes`

### ProductResearchSignal

- `id`
- `candidateId`
- `source`
- `metricName`
- `metricValue`
- `rawData`
- `collectedAt`

### ProductTestLaunch

- `id`
- `candidateId`
- `landingPageUrl`
- `channel`
- `channelDetail`
- `adSpendCents`
- `impressions`
- `clicks`
- `ctr`
- `productViews`
- `addToCart`
- `addToCartRate`
- `beginCheckout`
- `checkoutRate`
- `purchases`
- `purchaseRate`
- `revenueCents`
- `refunds`
- `customerFeedbackSummary`
- `notes`
- `testScore`
- `status`
- `startedAt`
- `endedAt`

### ProductResearchDecision

- `id`
- `candidateId`
- `decision`
- `reason`
- `operatorId`
- `createdAt`

### ProductResearchImportBatch

- `id`
- `source`
- `fileName`
- `totalRows`
- `createdCount`
- `skippedCount`
- `duplicateCount`
- `invalidCount`
- `createdBy`
- `createdAt`

### ProductResearchRiskFlag

- `id`
- `candidateId`
- `riskType`
- `severity`
- `message`
- `createdAt`

### ScoringRule

- `id`
- `version`
- `weights`
- `isActive`
- `createdAt`

## Backend Architecture

### New module

- `api/src/product-research/`

Top-level files:

- `product-research.module.ts`
- `product-research.controller.ts`
- `product-research.service.ts`

Internal services:

- `candidate.service.ts`
- `import.service.ts`
- `supplier.service.ts`
- `scoring.service.ts`
- `risk.service.ts`
- `signal.service.ts`
- `test-launch.service.ts`
- `decision.service.ts`
- `convert.service.ts`

### Why this split

- Candidate lifecycle is separate from import mechanics.
- Scoring must be deterministic and re-runnable.
- Risk review must remain independently auditable.
- Conversion into `Product` is a high-risk write path and should be isolated.
- Signal collection will evolve per provider and must not be baked into controllers.

## Provider Architecture

### Provider directories

- `api/src/product-research/providers/ai/`
- `api/src/product-research/providers/signals/`
- `api/src/product-research/providers/suppliers/`

### Core provider interfaces

- `AiResearchProvider`
- `MarketSignalProvider`
- `SupplierEnrichmentProvider`

### Planned phase-one real providers

- `openai-research.provider.ts`
- `google-trends.provider.ts`
- `gsc-signal.provider.ts`
- `ga4-signal.provider.ts`
- `etsy-signal.provider.ts`
- `tiktok-signal.provider.ts`
- `alibaba-link.provider.ts`

### Provider contract

Providers may:

- fetch or infer research data
- normalize external responses into internal DTOs
- return structured reasons and raw payloads

Providers may not:

- write final decisions
- mutate candidate status directly
- create `Product` records

## API Design

### Dashboard

- `GET /dashboard`

Returns:

- total candidates
- status distribution
- recommended action distribution
- high-risk count
- average `finalScore`
- average `validatedScore`
- recent import batches
- recent decisions

### Candidates

- `GET /candidates`
- `POST /candidates`
- `GET /candidates/:id`
- `PATCH /candidates/:id`
- `POST /candidates/:id/rescore`
- `POST /candidates/:id/risk-check`
- `POST /candidates/:id/approve`
- `POST /candidates/:id/reject`
- `POST /candidates/:id/convert-to-product`

List filters:

- `search`
- `status`
- `source`
- `category`
- `targetMarket`
- `recommendedAction`
- `riskSeverity`
- `sort`

### Imports

- `POST /import/ai/preview`
- `POST /import/ai/commit`
- `POST /import/csv/preview`
- `POST /import/csv/commit`
- `POST /import/supplier-quotes/preview`
- `POST /import/supplier-quotes/commit`
- `POST /import/alibaba-links/preview`
- `POST /import/alibaba-links/commit`
- `GET /import/batches`
- `GET /import/batches/:id`

### Suppliers

- `GET /suppliers`
- `GET /suppliers/:id`
- `POST /suppliers`
- `PATCH /suppliers/:id`
- `POST /candidates/:id/suppliers/link`
- `PATCH /candidates/:id/suppliers/:supplierId`

### Signals

- `GET /candidates/:id/signals`
- `POST /candidates/:id/signals/collect`
- `POST /candidates/:id/signals/manual`

### Scores

- `GET /candidates/:id/scores`
- `POST /candidates/:id/scores/recalculate`
- `POST /candidates/:id/scores/manual-adjust`

### Risk

- `GET /risk-review`
- `GET /candidates/:id/risk-flags`
- `POST /candidates/:id/risk-review/resolve`

### Test Launches

- `GET /test-launches`
- `POST /candidates/:id/test-launches`
- `GET /test-launches/:id`
- `PATCH /test-launches/:id`
- `POST /test-launches/:id/recalculate`
- `POST /test-launches/:id/complete`
- `POST /test-launches/:id/stop`

### Decisions

- `GET /decisions`
- `POST /candidates/:id/decisions`

### Scoring Rules

- `GET /scoring-rules`
- `POST /scoring-rules`
- `POST /scoring-rules/:id/activate`

## Frontend Admin Information Architecture

### `/admin/product-research/dashboard`

Show:

- total candidates
- status counts
- high-risk count
- recent import batches
- recent decisions
- average score metrics

### `/admin/product-research/candidates`

List page with:

- search
- filters
- sort
- bulk rescore
- bulk risk check
- bulk watch/reject

Columns:

- product name
- category
- target market
- source
- status
- final score
- risk score
- validated score
- recommended action
- risk badge
- supplier count
- updated time

### `/admin/product-research/candidates/new`

Manual candidate creation form.

### `/admin/product-research/candidates/[id]`

Tabbed detail page:

- `Overview`
- `Scores`
- `Suppliers`
- `Market Signals`
- `Risk Review`
- `Test Launches`
- `Decisions`
- `Notes`

### `/admin/product-research/import`

Import hub with cards for:

- AI generate
- candidate CSV
- supplier quote CSV
- Alibaba links

### `/admin/product-research/import/ai`

Flow:

- prompt input
- preview table
- duplicate warnings
- import selected

### `/admin/product-research/import/csv`

Flow:

- upload
- field mapping
- validation
- preview
- duplicate review
- commit

### `/admin/product-research/import/alibaba-links`

Flow:

- paste links
- optional notes
- preview
- commit

### `/admin/product-research/import/batches`

Batch history:

- source
- file name
- row counts
- duplicate/invalid counts
- operator
- created time

### `/admin/product-research/suppliers`

Supplier library:

- search
- filter
- edit
- quote visibility

### `/admin/product-research/scoring-rules`

Versioned weight rule management.

### `/admin/product-research/risk-review`

High-risk review queue.

### `/admin/product-research/test-launches`

Test launch list and detail management.

### `/admin/product-research/decisions`

Decision history feed.

## Permissions

- `VIEWER`
  - read-only across the module
- `ANALYST`
  - read scores, signals, tests
  - recalculate scores and test metrics
- `OPERATOR`
  - import candidates and supplier quotes
  - edit candidate basics
  - create test launches
  - add supplier links and quotes
- `CONTENT_EDITOR`
  - read-only or near read-only in this module
- `ADMIN`
  - approve/reject candidates
  - configure scoring rules
  - convert to product draft
- `SUPER_ADMIN`
  - full access

Critical permissions:

- `AI import commit`: `OPERATOR+`
- `CSV import commit`: `OPERATOR+`
- `manual score adjust`: `ANALYST+`
- `approve/reject`: `ADMIN+`
- `convert-to-product`: `ADMIN+`
- `activate scoring rule`: `ADMIN+`

## Scoring Engine

### Final score formula

```text
Final Score =
MarketDemand * 0.15
+ TrendSeasonality * 0.10
+ CompetitionGap * 0.10
+ MarginPotential * 0.15
+ LogisticsFit * 0.10
+ Brandability * 0.15
+ SupplierQuality * 0.10
+ RiskInverse * 0.10
+ Testability * 0.05
```

```text
RiskInverse = 100 - RiskScore
```

### Validated score formula

```text
Validated Score = Initial Score * 0.6 + Test Score * 0.4
```

### Test score formula

```text
Test Score =
Ad CTR * 0.15
+ Product Page Engagement * 0.10
+ Add to Cart Rate * 0.25
+ Begin Checkout Rate * 0.15
+ Purchase Rate * 0.20
+ Customer Feedback * 0.10
+ Refund/Complaint Risk * 0.05
```

### Execution model

Scoring is split into two layers:

1. signal collection
2. deterministic calculation

The service order:

1. collect candidate signals
2. normalize supplier data
3. ask AI for structured reasoning and draft sub-scores where needed
4. apply deterministic formulas and hard rules
5. persist a new `ProductCandidateScore`
6. update `ProductCandidate.finalScore`, `riskScore`, `validatedScore`, and `recommendedAction`

### AI role in scoring

AI may:

- infer candidate positioning
- infer market pain-point clarity
- infer brandability and content angles
- summarize reasoning by dimension
- classify candidate risk language

AI may not:

- bypass hard gates
- write final decisions
- override deterministic score formulas

### Scoring versioning

- all score runs write `scoringVersion`
- `ScoringRule.isActive = true` marks the current rule set
- historical scores remain immutable
- manual score adjustments create a new score record or mark the latest record as manually adjusted with reason

## Decision Rules

### Initial score decision

- `Final Score >= 85`
  - `Strong Test`
- `75 <= Final Score < 85`
  - `Test`
- `65 <= Final Score < 75`
  - `Watch`
- `50 <= Final Score < 65`
  - `Weak`
- `Final Score < 50`
  - `Reject`

### Overrides

- `RiskScore >= 70`
  - force `HIGH_RISK_REVIEW`
- `MarginPotentialScore < 50`
  - do not recommend ad test
- `SupplierQualityScore < 50`
  - do not recommend sampling
- `LogisticsFitScore < 50`
  - do not recommend one-piece fulfillment

### Validated score decisions

- `>= 85`
  - recommend small inventory buy of `100-300`
- `75-84`
  - continue optimizing page, price, and creatives
- `65-74`
  - retain for SEO/content validation only
- `< 65`
  - reject

## Risk Engine

### Automatic keyword risk detection

Auto-detect these keywords:

- `medical`
- `therapy`
- `pain relief`
- `cure`
- `children`
- `helmet`
- `electric`
- `heated`
- `supplement`
- `food`
- `replica`
- `branded`

### Hard gate categories

Default `REJECT` or `HIGH_RISK_REVIEW`:

- medical treatment claims
- child safety protection products
- helmets or strong safety gear
- electric therapy, massage, or heated products
- food, supplements, liquids, topical products
- obvious infringement or brand knockoffs
- unstable fulfillment
- low margin
- no sample availability
- unclear supplier image or copyright ownership

### Risk outputs

Each hit writes `ProductResearchRiskFlag` with:

- `riskType`
- `severity`
- `message`

Severity rules:

- informational concerns -> `LOW`
- cautionary compliance/logistics concerns -> `MEDIUM`
- strong concern -> `HIGH`
- hard gate -> `BLOCKING`

### Blocking behavior

If any `BLOCKING` flag exists:

- convert button disabled
- conversion endpoint rejects request
- candidate remains non-convertible until human review changes the underlying state

## Deduplication Design

### Exact duplicate rules

- identical `supplier_url`
- identical candidate source row fingerprint

### Candidate possible duplicate rules

- same `productName + category + targetMarket`
- slug-normalized fuzzy title match
- AI semantic similarity against existing active candidates

### Duplicate resolution policy

Duplicates never overwrite automatically.

Choices during import:

- `merge`
- `skip`
- `create anyway`

### Merge policy

For MVP:

- preserve original candidate
- append supplier links, quotes, and notes
- record merge details in import batch report and `AuditLog`

## Convert To Product Draft

### Preconditions

Candidate must satisfy all:

- `status = APPROVED`
- no `BLOCKING` risk flags
- at least one usable supplier or documented manual override

### Output behavior

Create formal `Product` with:

- `status = DRAFT`
- title from candidate product name
- slug from slug suggestion or normalized product name
- category from normalized candidate category
- short description from AI draft or operator-edited summary
- description from AI draft
- SEO title draft
- SEO description draft
- benefits draft
- features draft

### Explicit exclusions

Do not:

- auto-activate product
- auto-create live pricing promises
- auto-import supplier images as final product images
- auto-create inventory

### Supplier carry-over

Supplier details should be stored in:

- product research decision details
- product audit metadata

If supplier linkage to `Product` becomes a future feature, keep the conversion service isolated so it can later populate a product-supplier relation.

## AuditLog Events

Every critical operation writes `AuditLog`.

Recommended actions:

- `PRODUCT_RESEARCH_CANDIDATE_CREATED`
- `PRODUCT_RESEARCH_CANDIDATE_IMPORTED`
- `PRODUCT_RESEARCH_IMPORT_BATCH_CREATED`
- `PRODUCT_RESEARCH_IMPORT_MERGED`
- `PRODUCT_RESEARCH_IMPORT_SKIPPED_DUPLICATE`
- `PRODUCT_RESEARCH_SUPPLIER_CREATED`
- `PRODUCT_RESEARCH_SUPPLIER_LINKED`
- `PRODUCT_RESEARCH_SIGNALS_COLLECTED`
- `PRODUCT_RESEARCH_SCORED`
- `PRODUCT_RESEARCH_SCORE_MANUALLY_ADJUSTED`
- `PRODUCT_RESEARCH_RISK_CHECKED`
- `PRODUCT_RESEARCH_DECISION_RECORDED`
- `PRODUCT_RESEARCH_APPROVED`
- `PRODUCT_RESEARCH_REJECTED`
- `PRODUCT_RESEARCH_TEST_LAUNCH_CREATED`
- `PRODUCT_RESEARCH_TEST_LAUNCH_UPDATED`
- `PRODUCT_RESEARCH_TEST_SCORE_RECALCULATED`
- `PRODUCT_RESEARCH_CONVERTED_TO_PRODUCT_DRAFT`
- `PRODUCT_RESEARCH_SCORING_RULE_CREATED`
- `PRODUCT_RESEARCH_SCORING_RULE_ACTIVATED`

## README Updates Required

Add a new section covering:

- module purpose
- candidate lifecycle
- scoring formula
- risk hard gates
- import templates
- AI preview-before-import behavior
- convert-to-product restrictions
- required external API registrations
- new environment variables

## Verification

Required before completion:

- `npm run lint`
- `npm run build`

Recommended targeted checks:

- candidate AI preview and commit
- candidate CSV preview and commit
- supplier CSV preview and commit
- Alibaba links preview and commit
- scoring run
- hard gate risk blocking
- test score recalculation
- convert approved candidate to `Product.status = DRAFT`
