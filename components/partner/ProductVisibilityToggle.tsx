'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ProductVisibilityToggle({ productId, isActive }: { productId: string; isActive: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await fetch(`/api/partner/products/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !isActive }),
        })
        setBusy(false)
        router.refresh()
      }}
      className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {isActive ? 'Hide' : 'Show'}
    </button>
  )
}
