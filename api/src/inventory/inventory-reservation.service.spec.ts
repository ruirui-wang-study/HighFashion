import { BadRequestException } from "@nestjs/common";
import { InventoryMovementType } from "@prisma/client";
import { InventoryReservationService } from "./inventory-reservation.service";

describe("InventoryReservationService", () => {
  const service = new InventoryReservationService();

  it("throws when reservation cannot be satisfied", async () => {
    const tx = {
      $executeRaw: jest.fn().mockResolvedValue(0),
      inventoryMovement: { upsert: jest.fn() },
    };

    await expect(
      service.reserveForOrder(tx as never, "order_1", "PG1001", [{ variantId: "variant_1", quantity: 2 }]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("creates reservation movements when stock is reserved", async () => {
    const upsert = jest.fn().mockResolvedValue({ id: "movement_1" });
    const tx = {
      $executeRaw: jest.fn().mockResolvedValue(1),
      inventoryMovement: { upsert },
    };

    await service.reserveForOrder(tx as never, "order_1", "PG1001", [{ variantId: "variant_1", quantity: 2 }]);

    expect(upsert).toHaveBeenCalledWith({
      where: {
        orderId_variantId_type: {
          orderId: "order_1",
          variantId: "variant_1",
          type: InventoryMovementType.RESERVATION,
        },
      },
      create: expect.objectContaining({
        orderId: "order_1",
        variantId: "variant_1",
        type: InventoryMovementType.RESERVATION,
        quantity: 2,
      }),
      update: {},
    });
  });
});
