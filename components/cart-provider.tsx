"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProducts } from "@/lib/api-client";
import { reconcileCartItems } from "@/lib/cart-reconciliation";
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
  syncMessage: string | null;
  dismissSyncMessage: () => void;
  subtotalCents: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "pulsegear-cart";
const itemKey = (item: Pick<CartItem, "variantId">) => item.variantId;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const timeoutId = window.setTimeout(() => {
      if (stored) {
        try {
          setItems(JSON.parse(stored) as CartItem[]);
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }
      setHasLoadedCart(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [hasLoadedCart, items]);

  useEffect(() => {
    if (!hasLoadedCart || items.length === 0) return;

    let active = true;

    getProducts()
      .then((products) => {
        if (!active) return;
        const result = reconcileCartItems(items, products);
        if (result.removedCount === 0 && result.updatedCount === 0) return;

        setItems(result.items);

        const changes = [];
        if (result.removedCount > 0) changes.push(`${result.removedCount} unavailable item${result.removedCount > 1 ? "s were" : " was"} removed`);
        if (result.updatedCount > 0) changes.push(`${result.updatedCount} item${result.updatedCount > 1 ? "s were" : " was"} refreshed`);
        setSyncMessage(`Cart updated: ${changes.join(", ")}.`);
      })
      .catch(() => {
        if (!active) return;
      });

    return () => {
      active = false;
    };
  }, [hasLoadedCart, items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      clearCart: () => setItems([]),
      syncMessage,
      dismissSyncMessage: () => setSyncMessage(null),
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
  }, [items, isOpen, syncMessage]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export { itemKey };
