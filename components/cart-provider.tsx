"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/lib/types";

type AddInput = { product: Product; color: string; size: string; quantity?: number };

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: AddInput) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "pulsegear-cart";
const itemKey = (item: Pick<CartItem, "productId" | "color" | "size">) => `${item.productId}-${item.color}-${item.size}`;

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
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: ({ product, color, size, quantity = 1 }) => {
        setItems((current) => {
          const key = `${product.id}-${color}-${size}`;
          const existing = current.find((item) => itemKey(item) === key);
          if (existing) {
            return current.map((item) => (itemKey(item) === key ? { ...item, quantity: item.quantity + quantity } : item));
          }
          return [
            ...current,
            { productId: product.id, title: product.title, slug: product.slug, price: product.price, color, size, quantity },
          ];
        });
        setIsOpen(true);
      },
      removeItem: (key) => setItems((current) => current.filter((item) => itemKey(item) !== key)),
      updateQuantity: (key, quantity) => {
        setItems((current) =>
          current.flatMap((item) => {
            if (itemKey(item) !== key) return [item];
            if (quantity <= 0) return [];
            return [{ ...item, quantity }];
          }),
        );
      },
      subtotal,
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

