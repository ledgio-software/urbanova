'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function OrderStatusActions({ orderId, actions }: { orderId: string; actions: { status: string; label: string }[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function go(status: string) {
    if (status === 'cancelled' && !confirm('Cancel this order? This can’t be undone.')) return
    setBusy(status)
    setError(null)
    try {
      const res = await fetch(`/api/partner/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) setError(data.error ?? 'Could not update the order')
      else router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setBusy(null)
    }
  }

  if (actions.length === 0) return null
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.status}
            type="button"
            disabled={busy !== null}
            onClick={() => go(a.status)}
            className={`px-4 py-2 text-xs font-body font-semibold uppercase tracking-wider disabled:opacity-50 ${
              a.status === 'cancelled' ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-brand-red text-white hover:bg-brand-red/90'
            }`}
          >
            {busy === a.status ? 'Saving…' : a.label}
          </button>
        ))}
      </div>
      {error && <p className="font-body text-sm text-brand-red" role="alert">{error}</p>}
    </div>
  )
}
