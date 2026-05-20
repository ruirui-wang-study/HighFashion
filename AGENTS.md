\# PulseGear Project Instructions



\## Role

You are working on a DTC ecommerce storefront for a performance sports accessories brand.



\## Brand

PulseGear sells lightweight support and carry essentials for running, training, and court sports.



\## Design Style

Use a Performance Utility aesthetic:

\- graphite black

\- warm off-white

\- cool gray

\- electric lime accent

\- clean typography

\- mobile-first

\- high contrast CTAs

\- product benefits shown visually



\## Code Standards

\- Use Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui

\- Keep components reusable

\- Keep mock data in /data/products.ts

\- Use strong TypeScript types

\- Avoid large unnecessary dependencies

\- Maintain responsive design

\- Run lint/build after changes when possible



\## UX Rules

\- Product size selection must use button groups, not dropdowns

\- Product detail pages must include sticky mobile add-to-cart

\- Show trust badges near add-to-cart

\- Show shipping and returns information on product pages

\- Use scenario-based navigation: Run, Train, Court, Recover

\- Never make the site look like a general marketplace or dropshipping store



\## Content Tone

Professional, concise, performance-focused.

Avoid exaggerated claims.

Use functional language: support, breathable, no-slip, no-bounce, sweat-ready.



\# PulseGear SEO Rules



\## Project Context

PulseGear is a DTC ecommerce storefront for sports support and lightweight training accessories.



\## SEO Requirements

Every public page must have:

\- unique title

\- meta description

\- canonical URL

\- Open Graph metadata

\- Twitter metadata when applicable



\## Ecommerce SEO Rules

\- Product pages must use /products/{slug}

\- Collection pages must use /collections/{slug}

\- Do not index cart, checkout, success, account, admin, or API pages

\- Do not allow all filter combinations to be indexed

\- Sort, price, size, and color filter URLs should default to noindex, follow or canonicalize to the base collection

\- Only SEO-approved landing pages should be indexable



\## Structured Data Rules

Product pages must include:

\- Product JSON-LD

\- Offer or AggregateOffer

\- BreadcrumbList JSON-LD



Guide pages must include:

\- Article JSON-LD

\- BreadcrumbList JSON-LD



FAQ pages must include:

\- FAQPage JSON-LD only when the questions and answers are visible on the page



Never fake reviews, ratings, stock, price, or shipping data.



\## Content Rules

Use helpful, specific, non-spammy copy.

Avoid keyword stuffing.

Write for real buyers first:

\- runners

\- gym training users

\- court sport players

\- summer outdoor training users



\## Internal Linking

\- Product pages link to related guides

\- Guide pages link to related products and collections

\- Collection pages link to related guides

\- Footer links to key collections and guides



\## Validation

Before finishing SEO work:

\- run lint

\- run build

\- verify sitemap

\- verify robots

\- inspect page source for JSON-LD

\- check that unavailable pages return 404

