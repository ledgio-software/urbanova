'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  variantId: string
  productId: string
  productName: string
  sku: string
  size: string
  color: string
  price: number // pesewas
  quantity: number
  imageUrl?: string
  // Set for items sold by an URBANOVA stockist, who is paid directly — their items are checked out on their own
  seller?: { id: string; name: string }
}

/** Who the customer pays for this item: an URBANOVA stockist, or URBANOVA (also for Nova Market partners). */
export const sellerKey = (item: Pick<CartItem, 'seller'>) => item.seller?.id ?? 'urbanova'
export const sellerName = (item: Pick<CartItem, 'seller'>) => item.seller?.name ?? 'URBANOVA'

/** The bag item that blocks adding an item from a different payee, if any. */
export function payeeConflict(items: CartItem[], seller?: CartItem['seller']): CartItem | undefined {
  const key = seller?.id ?? 'urbanova'
  return items.find((i) => sellerKey(i) !== key)
}

type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (incoming) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === incoming.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === incoming.variantId
                  ? { ...i, quantity: i.quantity + incoming.quantity }
                  : i,
              ),
            }
          }
          return { items: [...state.items, incoming] }
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'urbanova-cart' },
  ),
)
