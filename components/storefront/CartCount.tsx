'use client'

import { useCart } from '@/lib/cart'

export function CartCount() {
  const totalItems = useCart((s) => s.totalItems())
  if (totalItems === 0) return null
  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white leading-none">
      {totalItems > 9 ? '9+' : totalItems}
    </span>
  )
}
