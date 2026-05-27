-- CreateEnum
CREATE TYPE "OrderInventoryStatus" AS ENUM ('OK', 'SHORT');

-- AlterEnum
ALTER TYPE "InventoryMovementType" ADD VALUE 'RESERVATION';
ALTER TYPE "InventoryMovementType" ADD VALUE 'RELEASE';

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN "reservedStock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "inventoryStatus" "OrderInventoryStatus" NOT NULL DEFAULT 'OK';

-- CreateIndex
CREATE UNIQUE INDEX "InventoryMovement_orderId_variantId_type_key" ON "InventoryMovement"("orderId", "variantId", "type");
