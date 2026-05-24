import type { CartItem, Product } from "@/lib/types";

export type CartReconciliationResult = {
  items: CartItem[];
  removedCount: number;
  updatedCount: number;
};

export function reconcileCartItems(items: CartItem[], products: Product[]): CartReconciliationResult {
  const variantMap = new Map(
    products.flatMap((product) =>
      product.variants.map((variant) => [
        variant.id,
        {
          product,
          variant,
        },
      ]),
    ),
  );

  const nextItems: CartItem[] = [];
  let removedCount = 0;
  let updatedCount = 0;

  for (const item of items) {
    const latest = variantMap.get(item.variantId);
    if (!latest || !latest.variant.active || latest.variant.stock <= 0) {
      removedCount += 1;
      continue;
    }

    const nextItem: CartItem = {
      variantId: latest.variant.id,
      productId: latest.product.id,
      title: latest.product.title,
      slug: latest.product.slug,
      unitPriceCents: latest.variant.priceCents,
      color: latest.variant.color,
      size: latest.variant.size,
      quantity: Math.min(item.quantity, latest.variant.stock),
    };

    if (
      nextItem.productId !== item.productId ||
      nextItem.title !== item.title ||
      nextItem.slug !== item.slug ||
      nextItem.unitPriceCents !== item.unitPriceCents ||
      nextItem.color !== item.color ||
      nextItem.size !== item.size ||
      nextItem.quantity !== item.quantity
    ) {
      updatedCount += 1;
    }

    nextItems.push(nextItem);
  }

  return { items: nextItems, removedCount, updatedCount };
}
