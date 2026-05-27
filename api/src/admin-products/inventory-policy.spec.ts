import { BadRequestException } from "@nestjs/common";
import { assertNextStockValue, getAvailableStock, getInventoryLevel } from "./inventory-policy";

describe("inventory policy", () => {
  it("uses available stock when reserved units exist", () => {
    expect(getAvailableStock({ stock: 10, reservedStock: 3 })).toBe(7);
    expect(getInventoryLevel({ stock: 10, reservedStock: 8, lowStockThreshold: 5 })).toBe("low_stock");
    expect(getInventoryLevel({ stock: 10, reservedStock: 10, lowStockThreshold: 5 })).toBe("out_of_stock");
  });

  it("marks low stock when stock is at or below the configured threshold", () => {
    expect(getInventoryLevel({ stock: 0, lowStockThreshold: 5 })).toBe("out_of_stock");
    expect(getInventoryLevel({ stock: 3, lowStockThreshold: 5 })).toBe("low_stock");
    expect(getInventoryLevel({ stock: 6, lowStockThreshold: 5 })).toBe("in_stock");
  });

  it("rejects adjustments that would drive stock below zero", () => {
    expect(() => assertNextStockValue({ currentStock: 2, quantityDelta: -3 })).toThrow(BadRequestException);
    expect(assertNextStockValue({ currentStock: 2, quantityDelta: -1 })).toBe(1);
  });
});
