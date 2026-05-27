import { BadRequestException } from "@nestjs/common";

export type InventoryLevel = "in_stock" | "low_stock" | "out_of_stock";

export function getAvailableStock(input: { stock: number; reservedStock?: number }) {
  const reserved = input.reservedStock ?? 0;
  return Math.max(0, input.stock - reserved);
}

export function getInventoryLevel(input: { stock: number; reservedStock?: number; lowStockThreshold: number }): InventoryLevel {
  const available = getAvailableStock(input);
  if (available <= 0) return "out_of_stock";
  if (available <= input.lowStockThreshold) return "low_stock";
  return "in_stock";
}

export function assertNextStockValue(input: { currentStock: number; quantityDelta: number }) {
  const nextStock = input.currentStock + input.quantityDelta;
  if (nextStock < 0) {
    throw new BadRequestException({ code: "NEGATIVE_STOCK", message: "Inventory cannot be reduced below zero" });
  }
  return nextStock;
}
