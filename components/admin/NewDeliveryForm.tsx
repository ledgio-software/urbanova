'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  riders: { id: string; name: string }[]
  /** When set, the delivery is for this website order (drop-off comes from the order). */
  order: { id: string; label: string; dropoffName: string; dropoffAddress: string; fee: string } | null
  defaultPickupAddress: string
}

const inputClass = 'w-full border border-gray-300 bg-white px-3 py-2 text-sm font-body focus:border-brand-black focus:outline-none'
const labelClass = 'mb-1.5 block text-xs font-body uppercase tracking-widest text-gray-500'

export function NewDeliveryForm({ riders, order, defaultPickupAddress }: Props) {
  const router = useRouter()
  const [f, setF] = useState({
    pickupName: '',
    pickupPhone: '',
    pickupAddress: defaultPickupAddress,
    dropoffName: '',
    dropoffPhone: '',
    dropoffAddress: '',
    fee: '',
    notes: '',
    riderId: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const common = { pickupAddress: f.pickupAddress, notes: f.notes, riderId: f.riderId || null }
    const payload = order
      ? { kind: 'order', orderId: order.id, ...common }
      : {
          kind: 'booking',
          ...common,
          pickupName: f.pickupName,
          pickupPhone: f.pickupPhone,
          dropoffName: f.dropoffName,
          dropoffPhone: f.dropoffPhone,
          dropoffAddress: f.dropoffAddress,
          fee: Math.round(parseFloat(f.fee || '0') * 100),
        }
    try {
      const res = await fetch('/api/admin/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        const fields = data.error?.fieldErrors as Record<string, string[]> | undefined
        setError(typeof data.error === 'string' ? data.error : Object.values(fields ?? {})[0]?.[0] ?? 'Please check the form')
        return
      }
      router.push(`/admin/deliveries/${data.id}`)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      {order && (
        <div className="border border-gray-200 bg-white p-5 font-body text-sm">
          <p className="text-xs uppercase tracking-widest text-gray-500">Website order {order.label}</p>
          <p className="mt-2 font-semibold text-brand-black">{order.dropoffName}</p>
          <p className="text-gray-600">{order.dropoffAddress}</p>
          <p className="mt-1 text-gray-500">Delivery fee paid by customer: {order.fee}</p>
        </div>
      )}

      <section className="space-y-4 border border-gray-200 bg-white p-5">
        <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Pickup</h2>
        {!order && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className={labelClass}>Sender name</span><input className={inputClass} required value={f.pickupName} onChange={(e) => set('pickupName', e.target.value)} /></label>
            <label className="block"><span className={labelClass}>Sender phone</span><input className={inputClass} required value={f.pickupPhone} onChange={(e) => set('pickupPhone', e.target.value)} /></label>
          </div>
        )}
        <label className="block">
          <span className={labelClass}>Pickup address</span>
          <input className={inputClass} required value={f.pickupAddress} onChange={(e) => set('pickupAddress', e.target.value)} placeholder="Street, area, landmark" />
        </label>
      </section>

      {!order && (
        <section className="space-y-4 border border-gray-200 bg-white p-5">
          <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Drop-off</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className={labelClass}>Recipient name</span><input className={inputClass} required value={f.dropoffName} onChange={(e) => set('dropoffName', e.target.value)} /></label>
            <label className="block"><span className={labelClass}>Recipient phone</span><input className={inputClass} required value={f.dropoffPhone} onChange={(e) => set('dropoffPhone', e.target.value)} /></label>
          </div>
          <label className="block"><span className={labelClass}>Drop-off address</span><input className={inputClass} required value={f.dropoffAddress} onChange={(e) => set('dropoffAddress', e.target.value)} placeholder="Street, area, landmark" /></label>
          <label className="block max-w-xs"><span className={labelClass}>Delivery fee (GHS)</span><input className={inputClass} type="number" min={0} step={0.5} required value={f.fee} onChange={(e) => set('fee', e.target.value)} /></label>
        </section>
      )}

      <section className="space-y-4 border border-gray-200 bg-white p-5">
        <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Rider & notes</h2>
        <label className="block max-w-sm">
          <span className={labelClass}>Assign rider</span>
          <select className={inputClass} value={f.riderId} onChange={(e) => set('riderId', e.target.value)}>
            <option value="">Assign later</option>
            {riders.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Notes for the rider</span>
          <textarea className={`${inputClass} min-h-20`} maxLength={500} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="e.g. Fragile, call on arrival, gate code…" />
        </label>
      </section>

      {error && <p className="text-sm font-body text-brand-red" role="alert">{error}</p>}
      <button type="submit" disabled={saving} className="bg-brand-red px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-wider text-white hover:bg-brand-red/90 disabled:opacity-50">
        {saving ? 'Creating…' : 'Create delivery'}
      </button>
    </form>
  )
}
