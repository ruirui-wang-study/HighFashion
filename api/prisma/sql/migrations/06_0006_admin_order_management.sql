CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "FulfillmentStatus" AS ENUM ('UNFULFILLED', 'FULFILLED');

ALTER TABLE "Order"
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'UNFULFILLED',
ADD COLUMN "fulfilledAt" TIMESTAMP(3);

UPDATE "Order"
SET "paymentStatus" = CASE
  WHEN "status" IN ('PAID', 'FULFILLED') THEN 'PAID'::"PaymentStatus"
  WHEN "status" IN ('PAYMENT_FAILED', 'EXPIRED', 'CANCELED') THEN 'FAILED'::"PaymentStatus"
  WHEN "status" = 'REFUNDED' THEN 'REFUNDED'::"PaymentStatus"
  ELSE 'PENDING'::"PaymentStatus"
END,
"fulfillmentStatus" = CASE
  WHEN "status" = 'FULFILLED' THEN 'FULFILLED'::"FulfillmentStatus"
  ELSE 'UNFULFILLED'::"FulfillmentStatus"
END,
"fulfilledAt" = CASE
  WHEN "status" = 'FULFILLED' THEN "updatedAt"
  ELSE NULL
END;

CREATE TABLE "OrderNote" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderStatusEvent" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "fromValue" TEXT,
  "toValue" TEXT,
  "details" JSONB,
  "createdByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderStatusEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Order_paymentStatus_fulfillmentStatus_idx" ON "Order"("paymentStatus", "fulfillmentStatus");
CREATE INDEX "OrderNote_orderId_createdAt_idx" ON "OrderNote"("orderId", "createdAt");
CREATE INDEX "OrderNote_createdByAdminId_idx" ON "OrderNote"("createdByAdminId");
CREATE INDEX "OrderStatusEvent_orderId_createdAt_idx" ON "OrderStatusEvent"("orderId", "createdAt");
CREATE INDEX "OrderStatusEvent_createdByAdminId_idx" ON "OrderStatusEvent"("createdByAdminId");

ALTER TABLE "OrderNote" ADD CONSTRAINT "OrderNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderNote" ADD CONSTRAINT "OrderNote_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderStatusEvent" ADD CONSTRAINT "OrderStatusEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderStatusEvent" ADD CONSTRAINT "OrderStatusEvent_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
