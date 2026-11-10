'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'

export function CartCount() {
  const totalItems = useCart((s) => s.totalItems())
  // The cart lives in localStorage, so the server always renders an empty cart. Showing the
  // badge only after mount keeps the first client render identical (no hydration mismatch).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || totalItems === 0) return null
  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white leading-none">
      {totalItems > 9 ? '9+' : totalItems}
    </span>
  )
}
