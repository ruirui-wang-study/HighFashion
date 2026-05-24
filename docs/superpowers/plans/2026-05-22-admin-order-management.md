# Admin Order Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build admin order management with searchable/filterable order list, order detail, internal notes, fulfill action, audit logging, and minimal storefront order status synchronization.

**Architecture:** Extend the existing `Order` model with formal payment and fulfillment state, add `OrderNote` and `OrderStatusEvent` for lightweight OMS history, then implement one admin orders module that owns list/detail/note/fulfill flows. Keep storefront changes narrow by upgrading the existing order response shape and checkout success page to read the new order status fields without adding new customer-facing order management surfaces.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, NestJS, Prisma, Jest

---

## File Structure

- Modify: `api/prisma/schema.prisma`
- Create: `api/prisma/migrations/0006_admin_order_management/migration.sql`
- Modify: `api/prisma/seed.ts`
- Create: `api/src/admin-orders/admin-orders.module.ts`
- Create: `api/src/admin-orders/admin-orders.controller.ts`
- Create: `api/src/admin-orders/admin-orders.service.ts`
- Create: `api/src/admin-orders/admin-orders.types.ts`
- Create: `api/src/admin-orders/admin-orders.service.spec.ts`
- Create: `api/src/admin-orders/dto/admin-order-query.dto.ts`
- Create: `api/src/admin-orders/dto/update-order-note.dto.ts`
- Modify: `api/src/app.module.ts`
- Modify: `api/src/orders/order-response.ts`
- Modify: `api/src/orders/orders.service.ts`
- Modify: `lib/types.ts`
- Create: `lib/admin-orders-types.ts`
- Modify: `lib/admin-api.ts`
- Create: `components/admin/admin-orders-page.tsx`
- Create: `components/admin/admin-order-detail-page.tsx`
- Create: `components/admin/admin-order-status-badge.tsx`
- Modify: `app/admin/orders/page.tsx`
- Create: `app/admin/orders/[id]/page.tsx`
- Modify: `app/checkout/success/checkout-success-client.tsx`

### Task 1: Extend Prisma Order Models

**Files:**
- Modify: `api/prisma/schema.prisma`
- Create: `api/prisma/migrations/0006_admin_order_management/migration.sql`

- [ ] **Step 1: Write the failing admin orders test**

Create `api/src/admin-orders/admin-orders.service.spec.ts` with a failing test that expects order list and detail responses to expose:
- `paymentStatus`
- `fulfillmentStatus`
- `fulfilledAt`
- `notes`
- `statusEvents`

- [ ] **Step 2: Run the targeted test to verify red**

Run: `npm --prefix api test -- admin-orders.service.spec.ts`
Expected: FAIL because the module and Prisma types do not exist yet.

- [ ] **Step 3: Add minimal Prisma enums and models**

Extend `Order` with:

```prisma
enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum FulfillmentStatus {
  UNFULFILLED
  FULFILLED
}
```

Add fields:

```prisma
paymentStatus     PaymentStatus     @default(PENDING)
fulfillmentStatus FulfillmentStatus @default(UNFULFILLED)
fulfilledAt       DateTime?
notes             OrderNote[]
statusEvents      OrderStatusEvent[]
```

Add:

```prisma
model OrderNote {
  id               String    @id @default(cuid())
  orderId          String
  note             String
  createdByAdminId String?
  createdAt        DateTime  @default(now())
  order            Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  createdByAdmin   AdminUser? @relation(fields: [createdByAdminId], references: [id], onDelete: SetNull)
}
```

```prisma
model OrderStatusEvent {
  id               String    @id @default(cuid())
  orderId          String
  type             String
  fromValue        String?
  toValue          String?
  details          Json?
  createdByAdminId String?
  createdAt        DateTime  @default(now())
  order            Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  createdByAdmin   AdminUser? @relation(fields: [createdByAdminId], references: [id], onDelete: SetNull)
}
```

- [ ] **Step 4: Write the SQL migration**

Create `api/prisma/migrations/0006_admin_order_management/migration.sql` with new enums, fields, tables, indexes, and foreign keys.

- [ ] **Step 5: Generate Prisma client and re-run the test**

Run:
- `npm --prefix api run prisma:generate`
- `npm --prefix api test -- admin-orders.service.spec.ts`

Expected: FAIL later in service behavior, not on missing Prisma types.

### Task 2: Build Admin Orders Service

**Files:**
- Create: `api/src/admin-orders/admin-orders.module.ts`
- Create: `api/src/admin-orders/admin-orders.controller.ts`
- Create: `api/src/admin-orders/admin-orders.service.ts`
- Create: `api/src/admin-orders/admin-orders.types.ts`
- Create: `api/src/admin-orders/dto/admin-order-query.dto.ts`
- Create: `api/src/admin-orders/dto/update-order-note.dto.ts`
- Modify: `api/src/admin-orders/admin-orders.service.spec.ts`

- [ ] **Step 1: Expand the failing tests**

Add failing tests for:
- list orders by `orderNo` / `email`
- filter by `paymentStatus`
- filter by `fulfillmentStatus`
- filter by date range
- get order detail with items, stripe IDs, shipping address, notes, and status events
- add order note
- mark order fulfilled
- write `AuditLog` for note add and fulfill actions

- [ ] **Step 2: Run the targeted test to verify red**

Run: `npm --prefix api test -- admin-orders.service.spec.ts`
Expected: FAIL with missing methods.

- [ ] **Step 3: Implement minimal service methods**

Implement:

```ts
findAll(query: AdminOrderQueryDto)
findById(id: string)
addNote(id: string, actor: AdminActor, input: UpdateOrderNoteDto)
markFulfilled(id: string, actor: AdminActor)
```

Use transactions for mutations. `markFulfilled()` should:
- set `fulfillmentStatus = FULFILLED`
- set `status = FULFILLED`
- set `fulfilledAt = now`
- create `OrderStatusEvent`
- create `AuditLog`

`addNote()` should:
- create `OrderNote`
- create `AuditLog`

- [ ] **Step 4: Add controller routes and role guards**

Expose:
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `POST /api/admin/orders/:id/notes`
- `POST /api/admin/orders/:id/fulfill`

Guard with `@AdminRoles("OPERATOR", "ADMIN", "SUPER_ADMIN")`.

- [ ] **Step 5: Re-run the service test**

Run: `npm --prefix api test -- admin-orders.service.spec.ts`
Expected: PASS

### Task 3: Seed Formal Order Status Fields

**Files:**
- Modify: `api/prisma/seed.ts`

- [ ] **Step 1: Add a failing assertion in service tests or manual query expectation**

Expect seeded orders to have non-null `paymentStatus` and `fulfillmentStatus`.

- [ ] **Step 2: Update seed logic**

When creating any seeded orders later, map:
- `PENDING -> paymentStatus=PENDING, fulfillmentStatus=UNFULFILLED`
- `PAID -> paymentStatus=PAID, fulfillmentStatus=UNFULFILLED`
- `FULFILLED -> paymentStatus=PAID, fulfillmentStatus=FULFILLED`
- `PAYMENT_FAILED / EXPIRED -> paymentStatus=FAILED`
- `REFUNDED -> paymentStatus=REFUNDED`

Also clear `OrderNote` and `OrderStatusEvent` before `Order` if seed resets order data.

- [ ] **Step 3: Re-run Prisma seed**

Run: `npm --prefix api run prisma:seed`
Expected: PASS

### Task 4: Upgrade Storefront Order Response

**Files:**
- Modify: `api/src/orders/order-response.ts`
- Modify: `api/src/orders/orders.service.ts`
- Modify: `lib/types.ts`
- Modify: `app/checkout/success/checkout-success-client.tsx`

- [ ] **Step 1: Add a failing type/build check**

Update frontend `Order` type to require:
- `paymentStatus`
- `fulfillmentStatus`
- `fulfilledAt`

Then run the frontend build before implementation.

- [ ] **Step 2: Run build to confirm red**

Run: `npm run build`
Expected: FAIL where old order response shape is still used.

- [ ] **Step 3: Implement response normalization**

Update `normalizeOrderResponse()` to include:
- `paymentStatus`
- `fulfillmentStatus`
- `fulfilledAt`

Update checkout success UI to prefer:
- payment tile from `paymentStatus`
- fulfillment text from `fulfillmentStatus`

Keep legacy `status` for compatibility.

- [ ] **Step 4: Re-run build**

Run: `npm run build`
Expected: PASS for storefront order response changes.

### Task 5: Add Admin Orders Pages

**Files:**
- Create: `lib/admin-orders-types.ts`
- Modify: `lib/admin-api.ts`
- Create: `components/admin/admin-orders-page.tsx`
- Create: `components/admin/admin-order-detail-page.tsx`
- Create: `components/admin/admin-order-status-badge.tsx`
- Modify: `app/admin/orders/page.tsx`
- Create: `app/admin/orders/[id]/page.tsx`

- [ ] **Step 1: Add a build-driven failing check**

Create route files that import not-yet-created admin order components.

- [ ] **Step 2: Run build to verify red**

Run: `npm run build`
Expected: FAIL with missing admin order imports/types.

- [ ] **Step 3: Implement admin pages**

Build:
- list page with search, payment status filter, fulfillment status filter, date filter
- detail page with:
  - core order metadata
  - Stripe Checkout Session ID / PaymentIntent ID
  - address
  - item table
  - notes list
  - note add form
  - fulfill button
  - status timeline

- [ ] **Step 4: Re-run build**

Run: `npm run build`
Expected: PASS

### Task 6: Final Verification

**Files:**
- Review only

- [ ] **Step 1: Run admin orders tests**

Run: `npm --prefix api test -- admin-orders.service.spec.ts`
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
- order list renders
- order detail renders
- note add works
- fulfill action works
- checkout success still renders upgraded order status fields
