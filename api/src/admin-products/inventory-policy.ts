import { BadRequestException } from "@nestjs/common";

export type InventoryLevel = "in_stock" | "low_stock" | "out_of_stock";

export function getInventoryLevel(input: { stock: number; lowStockThreshold: number }): InventoryLevel {
  if (input.stock <= 0) return "out_of_stock";
  if (input.stock <= input.lowStockThreshold) return "low_stock";
  return "in_stock";
}

export function assertNextStockValue(input: { currentStock: number; quantityDelta: number }) {
  const nextStock = input.currentStock + input.quantityDelta;
  if (nextStock < 0) {
    throw new BadRequestException({ code: "NEGATIVE_STOCK", message: "Inventory cannot be reduced below zero" });
  }
  return nextStock;
}
