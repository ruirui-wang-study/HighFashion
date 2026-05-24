# Admin Content Management Design

## Summary

Build a content management module for PulseGear focused on:

- `/admin/content/guides`
- `/admin/content/guides/new`
- `/admin/content/guides/[id]`
- `/admin/content/faq`

This phase introduces a database-backed content system centered on guides and FAQs, while also reserving architecture space for collection landing page content. Existing guide content from `data/guides.ts` will be imported into the database once, then storefront guide pages and sitemap generation will read published guide content from the database only.

## Goals

- Create and edit guides from the admin.
- Manage draft, published, and archived guide states.
- Edit SEO title and SEO description in admin.
- Associate guides with products and collections.
- Preview guides before publishing.
- Manage FAQs from admin.
- Write audit logs for create, update, and publishing state changes.
- Make storefront `/guides` and `/guides/[slug]` read published guides from the database.
- Exclude draft guides from the storefront and sitemap.

## Non-Goals

- Visual page builder or WYSIWYG editor.
- Full-site CMS covering homepage, about page, or product descriptions.
- Rich media asset management.

## Data Model

### ContentEntry

Shared content header table for all managed content types:

- `id`
- `type` (`GUIDE`, `FAQ`, `COLLECTION_PAGE`)
- `title`
- `slug`
- `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `seoTitle`
- `seoDescription`
- `publishedAt`
- `createdAt`
- `updatedAt`

### GuideContent

Guide-specific detail table:

- `entryId`
- `dek`
- `category`
- `authorName`
- `authorRole`
- `readTime`
- `sections` (JSON)
- `faq` (JSON)
- `relatedProducts` (JSON for first phase)
- `relatedCollections` (JSON for first phase)
- `relatedGuides` (JSON for first phase)

### FaqContent

FAQ-specific detail table:

- `entryId`
- `items` (JSON)

### CollectionLandingContent

Reserved in architecture for future admin management:

- `entryId`
- `pathname`
- `scenario`
- `intro`
- `category`
- `useCase`
- `relatedGuideSlugs` (JSON)

This entity can be modeled now even if the full admin editing UI is deferred.

## Import Strategy

Existing guide content in `data/guides.ts` is imported into the database as `PUBLISHED` records.

Rules:

- import once into the CMS tables
- after import, storefront guides read from database
- local static guide data no longer acts as the storefront primary source

## Routes

### Admin routes

- `/admin/content/guides`
- `/admin/content/guides/new`
- `/admin/content/guides/[id]`
- `/admin/content/faq`

### API routes

Recommended first-phase API shape:

- `/api/admin/content/guides`
- `/api/admin/content/guides/:id`
- `/api/admin/content/guides/:id/publish`
- `/api/admin/content/guides/:id/archive`
- `/api/admin/content/guides/:id/draft`
- `/api/admin/content/faq`

### Storefront routes

- `/guides`
- `/guides/[slug]`

## Admin UI

### Guide list

The guide list page should support:

- list guides
- filter by status
- show updated time
- create new guide
- open edit page

### Guide editor

The guide editor should include sections for:

- Basic
  - title
  - slug
  - dek
  - category
  - author name
  - author role
  - read time
- SEO
  - SEO title
  - SEO description
- Body
  - repeatable article sections
  - repeatable FAQ items embedded in the guide
- Relations
  - related products
  - related collections
  - related guides
- Publishing
  - draft
  - publish
  - archive
  - preview

### FAQ admin

The FAQ admin page should support:

- list FAQ items
- add item
- edit item
- remove item
- reorder item
- save changes

## Preview

Guide preview should allow editors to inspect a guide before it is published.

Recommended first-phase behavior:

- preview route or preview mode reads guide by internal ID
- preview can render draft content
- storefront public route continues to read published-by-slug only

## Storefront Behavior

### Guide list page

`/guides` reads guides from the database where:

- `type = GUIDE`
- `status = PUBLISHED`

### Guide detail page

`/guides/[slug]` reads one guide from the database where:

- `type = GUIDE`
- `slug = [slug]`
- `status = PUBLISHED`

If no published guide exists for the slug:

- return `404`

### Sitemap

Guide entries appear in sitemap only when:

- `status = PUBLISHED`

Draft or archived guides must not be listed.

## Audit Log

Write audit log entries for:

- content created
- content updated
- content published
- content archived
- content reverted to draft
- FAQ updated

Suggested action names:

- `CONTENT_CREATED`
- `CONTENT_UPDATED`
- `CONTENT_PUBLISHED`
- `CONTENT_ARCHIVED`
- `CONTENT_DRAFTED`
- `FAQ_UPDATED`

## Backend Design

Add a dedicated admin content module or modules for:

- guide management
- FAQ management
- guide storefront querying
- guide import service

Separate responsibilities:

- admin CRUD service
- storefront read service
- import/bootstrap service
- audit logging hooks

## Frontend Design

New admin components:

- `admin-guides-page`
- `admin-guide-editor`
- `admin-guide-preview`
- `admin-faq-page`

Shared utilities:

- content status badge
- repeatable list editor helpers
- relationship selectors

Use simple structured inputs and repeatable blocks rather than adding a large rich text editor dependency.

## Testing

### Backend

Add tests for:

- guide create
- guide update
- publish / archive / draft transitions
- storefront queries return published content only
- guide import from local data
- FAQ update

### Frontend

Verify:

- guide list page compiles
- new guide page compiles
- guide edit page compiles
- FAQ admin page compiles
- storefront guide routes compile against database-backed fetchers

### Final verification

Run:

- `npm run build`

Recommended:

- `npm run lint`
- `npm --prefix api run build`
- relevant API tests

## Implementation Direction

1. Add CMS-oriented Prisma models and migration.
2. Add guide import/bootstrap from `data/guides.ts`.
3. Implement backend admin guide and FAQ services plus audit logs.
4. Implement admin content UI for guides and FAQs.
5. Switch storefront guide routes and sitemap to database-backed published guides.
