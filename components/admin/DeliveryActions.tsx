'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DeliveryStatus } from '@prisma/client'

interface Props {
  jobId: string
  status: DeliveryStatus
  currentRiderId: string | null
  riders: { id: string; name: string }[]
}

export function DeliveryActions({ jobId, status, currentRiderId, riders }: Props) {
  const router = useRouter()
  const [riderId, setRiderId] = useState(currentRiderId ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canAssign = ['pending', 'assigned', 'failed'].includes(status)
  const open = !['delivered', 'cancelled'].includes(status)

  async function act(body: Record<string, unknown>) {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/deliveries/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not update delivery')
        return
      }
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <section className="space-y-4 border border-gray-200 bg-white p-5 font-body text-sm">
      <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Actions</h2>
      {canAssign && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-gray-500">
              {status === 'failed' ? 'Try again with rider' : currentRiderId ? 'Change rider' : 'Assign rider'}
            </span>
            <select className="border border-gray-300 px-3 py-2" value={riderId} onChange={(e) => setRiderId(e.target.value)}>
              <option value="">Choose rider…</option>
              {riders.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <button
            type="button"
            disabled={busy || !riderId || (riderId === currentRiderId && status === 'assigned')}
            onClick={() => act({ action: 'assign', riderId })}
            className="bg-brand-black px-4 py-2 text-xs uppercase tracking-wider text-white disabled:opacity-40"
          >
            Assign
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const note = prompt('How was delivery confirmed? (e.g. customer called to confirm, lost code)')
            if (note) act({ action: 'mark_delivered', note })
          }}
          className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50"
        >
          Mark delivered (override)
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (confirm('Cancel this delivery?')) act({ action: 'cancel', note: prompt('Reason (optional)') ?? undefined })
          }}
          className="border border-red-200 px-3 py-1.5 text-xs uppercase tracking-wider text-brand-red hover:bg-red-50"
        >
          Cancel delivery
        </button>
      </div>
      {error && <p className="text-brand-red" role="alert">{error}</p>}
    </section>
  )
}
