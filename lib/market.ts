import type { Prisma } from '@prisma/client'

// Visibility rules for products (Reference Part I). Every storefront query uses one of these,
// so a hidden product, or a product from a pending/suspended partner, never shows or sells.

/** URBANOVA's own clothing — the main Shop. */
export const storeProductWhere: Prisma.ProductWhereInput = {
  partnerId: null,
  isActive: true,
  adminHidden: false,
}

/** Nova Market partner products — only from live partners. */
export const marketProductWhere: Prisma.ProductWhereInput = {
  partnerId: { not: null },
  isActive: true,
  adminHidden: false,
  partner: { status: 'active' },
}

/** Anything a customer may see or buy. */
export const sellableProductWhere: Prisma.ProductWhereInput = {
  OR: [storeProductWhere, marketProductWhere],
}

/** Same rule for a product already loaded with its partner's status. */
export function isSellable(product: {
  partnerId: string | null
  isActive: boolean
  adminHidden: boolean
  partner: { status: string } | null
}): boolean {
  if (!product.isActive || product.adminHidden) return false
  return product.partnerId === null || product.partner?.status === 'active'
}

/** Default categories offered to the admin when no market categories exist yet. */
export const SUGGESTED_MARKET_CATEGORIES = ['Fashion', 'Accessories', 'Art & Prints', 'Beauty', 'Food & Drinks', 'Home', 'Other']

/** Label for a variant's options; partner items without sizes/colours use "One size" / "Standard". */
export function optionLabel(v: { size: string; color: string }): string {
  return [v.size, v.color].filter((x) => x && x !== 'One size' && x !== 'Standard').join(' · ') || 'Standard'
}
