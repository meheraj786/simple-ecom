"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { VariantOption } from "@/server/types";

export type CartLine = {
  productId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  variantId: string;
  sku: string;
  unitPrice: string;
  options: VariantOption[];
  quantity: number;
};

type CartState = {
  items: CartLine[];
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (line) => line.variantId === item.variantId,
          );
          return {
            items: existing
              ? state.items.map((line) =>
                  line.variantId === item.variantId
                    ? { ...line, quantity: line.quantity + quantity }
                    : line,
                )
              : [...state.items, { ...item, quantity }],
          };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((line) => line.variantId !== variantId)
              : state.items.map((line) =>
                  line.variantId === variantId ? { ...line, quantity } : line,
                ),
        })),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((line) => line.variantId !== variantId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "single-ecom-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
