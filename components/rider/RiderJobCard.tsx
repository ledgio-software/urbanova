'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DeliveryStatus } from '@prisma/client'

export interface RiderJob {
  id: string
  trackingCode: string
  status: DeliveryStatus
  statusLabel: string
  pickupName: string
  pickupPhone: string
  pickupAddress: string
  dropoffName: string
  dropoffPhone: string
  dropoffAddress: string
  notes: string | null
  pickupMapUrl: string
  dropoffMapUrl: string
}

function Stop({ label, name, phone, address, mapUrl, highlight }: { label: string; name: string; phone: string; address: string; mapUrl: string; highlight: boolean }) {
  return (
    <div className={`p-4 ${highlight ? 'bg-amber-50' : ''}`}>
      <p className="text-[11px] uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-brand-black">{name}</p>
      <p className="text-sm text-gray-700">{address}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {phone ? (
          <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 border border-gray-300 bg-white py-3 text-sm font-semibold uppercase tracking-wider text-brand-black">
            Call
          </a>
        ) : (
          <span />
        )}
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center border border-gray-300 bg-white py-3 text-sm font-semibold uppercase tracking-wider text-brand-black">
          Map
        </a>
      </div>
    </div>
  )
}

export function RiderJobCard({ job }: { job: RiderJob }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'idle' | 'code' | 'fail'>('idle')
  const [code, setCode] = useState('')
  const [reason, setReason] = useState('')

  async function send(body: Record<string, string>) {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/rider/jobs/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setMode('idle')
      setCode('')
      router.refresh()
    } catch {
      setError('No connection — try again')
    } finally {
      setBusy(false)
    }
  }

  const before = job.status === 'assigned'
  const primary =
    job.status === 'assigned'
      ? { label: 'I’ve picked it up', action: 'picked_up' }
      : job.status === 'picked_up'
        ? { label: 'On my way to customer', action: 'on_the_way' }
        : null

  return (
    <article className="overflow-hidden border border-gray-200 bg-white font-body shadow-sm" data-testid="rider-job">
      <div className="flex items-center justify-between bg-brand-black px-4 py-2 text-white">
        <span className="font-mono text-sm">{job.trackingCode}</span>
        <span className="text-xs uppercase tracking-wider" data-testid="rider-job-status">{job.statusLabel}</span>
      </div>
      <div className="divide-y divide-gray-100">
        <Stop label="1 · Pick up from" name={job.pickupName} phone={job.pickupPhone} address={job.pickupAddress} mapUrl={job.pickupMapUrl} highlight={before} />
        <Stop label="2 · Deliver to" name={job.dropoffName} phone={job.dropoffPhone} address={job.dropoffAddress} mapUrl={job.dropoffMapUrl} highlight={!before} />
        {job.notes && <p className="p-4 text-sm text-gray-700"><span className="text-[11px] uppercase tracking-widest text-gray-500">Notes</span><br />{job.notes}</p>}
      </div>

      <div className="space-y-2 border-t border-gray-200 p-4">
        {mode === 'code' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send({ action: 'delivered', code })
            }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold">Ask the customer for their 4-digit delivery code</label>
            <input
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              autoFocus
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-gray-300 py-3 text-center font-mono text-3xl tracking-[0.5em]"
              aria-label="Delivery code"
            />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMode('idle')} className="border border-gray-300 py-3 text-sm uppercase tracking-wider">Back</button>
              <button type="submit" disabled={busy || code.length !== 4} className="bg-green-700 py-3 text-sm font-semibold uppercase tracking-wider text-white disabled:opacity-50">Confirm</button>
            </div>
          </form>
        ) : mode === 'fail' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send({ action: 'failed', reason })
            }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold">What happened?</label>
            <textarea required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-gray-300 p-3 text-base" placeholder="e.g. Customer not reachable, wrong address" />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMode('idle')} className="border border-gray-300 py-3 text-sm uppercase tracking-wider">Back</button>
              <button type="submit" disabled={busy} className="bg-brand-red py-3 text-sm font-semibold uppercase tracking-wider text-white disabled:opacity-50">Report</button>
            </div>
          </form>
        ) : (
          <>
            {primary && (
              <button type="button" disabled={busy} onClick={() => send({ action: primary.action })} className="w-full bg-brand-red py-4 text-base font-semibold uppercase tracking-wider text-white disabled:opacity-50">
                {primary.label}
              </button>
            )}
            {job.status !== 'assigned' && (
              <button type="button" disabled={busy} onClick={() => setMode('code')} className="w-full bg-green-700 py-4 text-base font-semibold uppercase tracking-wider text-white disabled:opacity-50">
                Delivered — enter code
              </button>
            )}
            <button type="button" disabled={busy} onClick={() => setMode('fail')} className="w-full py-2 text-sm uppercase tracking-wider text-gray-500 underline">
              Can’t complete this delivery
            </button>
          </>
        )}
        {error && <p className="text-sm text-brand-red" role="alert">{error}</p>}
      </div>
    </article>
  )
}
