"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product, ProductVariant } from "@/lib/types";

type AddInput = { product: Product; variant: ProductVariant; quantity?: number };

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: AddInput) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotalCents: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "pulsegear-cart";
const itemKey = (item: Pick<CartItem, "variantId">) => item.variantId;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      clearCart: () => setItems([]),
      addItem: ({ product, variant, quantity = 1 }) => {
        setItems((current) => {
          const existing = current.find((item) => item.variantId === variant.id);
          if (existing) {
            return current.map((item) => (item.variantId === variant.id ? { ...item, quantity: item.quantity + quantity } : item));
          }
          return [
            ...current,
            {
              variantId: variant.id,
              productId: product.id,
              title: product.title,
              slug: product.slug,
              unitPriceCents: variant.priceCents,
              color: variant.color,
              size: variant.size,
              quantity,
            },
          ];
        });
        setIsOpen(true);
      },
      removeItem: (variantId) => setItems((current) => current.filter((item) => item.variantId !== variantId)),
      updateQuantity: (variantId, quantity) => {
        setItems((current) =>
          current.flatMap((item) => {
            if (item.variantId !== variantId) return [item];
            if (quantity <= 0) return [];
            return [{ ...item, quantity }];
          }),
        );
      },
      subtotalCents,
      itemCount,
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export { itemKey };
