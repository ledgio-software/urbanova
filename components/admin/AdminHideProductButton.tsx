'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminHideProductButton({ productId, adminHidden }: { productId: string; adminHidden: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!adminHidden && !confirm('Hide this product from Nova Market? The partner can’t show it again until you unhide it.')) return
        setBusy(true)
        await fetch(`/api/admin/partner-products/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminHidden: !adminHidden }),
        })
        setBusy(false)
        router.refresh()
      }}
      className={`border px-3 py-1.5 text-xs uppercase tracking-wider disabled:opacity-50 ${adminHidden ? 'border-gray-300 text-gray-700' : 'border-red-200 text-brand-red'}`}
    >
      {adminHidden ? 'Unhide' : 'Hide'}
    </button>
  )
}
