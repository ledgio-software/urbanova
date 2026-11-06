'use client'

import { useEffect, useState } from 'react'
import { OneTimePassword } from '@/components/admin/OneTimePassword'

type Rider = {
  id: string
  name: string
  phone: string
  email: string
  vehicle: string | null
  status: 'active' | 'suspended'
  lastLoginAt: string | null
}

const inputClass = 'border border-gray-300 px-3 py-2 text-sm font-body focus:border-brand-black focus:outline-none'

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', vehicle: '' })
  const [error, setError] = useState<string | null>(null)
  const [issued, setIssued] = useState<{ email: string; tempPassword: string; phone: string } | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/admin/riders')
      setRiders(await res.json())
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function addRider(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/admin/riders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      const fields = data.error?.fieldErrors as Record<string, string[]> | undefined
      setError(typeof data.error === 'string' ? data.error : Object.values(fields ?? {})[0]?.[0] ?? 'Please check the form')
      return
    }
    setIssued({ ...data.login, phone: form.phone })
    setForm({ name: '', phone: '', email: '', vehicle: '' })
    setAdding(false)
    load()
  }

  async function setStatus(r: Rider, status: Rider['status']) {
    if (status === 'suspended' && !confirm(`Suspend ${r.name}? They will be logged out and can't be given deliveries.`)) return
    await fetch(`/api/admin/riders/${r.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: r.name, phone: r.phone, vehicle: r.vehicle, status }),
    })
    load()
  }

  async function resetPassword(r: Rider) {
    if (!confirm(`Reset the password for ${r.name}? Their current password will stop working.`)) return
    const res = await fetch(`/api/admin/riders/${r.id}/reset-password`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) setIssued({ ...data.login, phone: r.phone })
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Riders</h1>
          <p className="mt-1 text-xs font-body text-gray-500">
            URBANOVA Delivery riders. They log in at <span className="font-mono">/rider/login</span> on their phone.
          </p>
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          className="self-start bg-brand-red px-4 py-2 text-xs font-body font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-brand-red/90 sm:self-auto"
        >
          {adding ? 'Cancel' : '+ Add Rider'}
        </button>
      </div>

      {issued && <OneTimePassword email={issued.email} password={issued.tempPassword} phone={issued.phone} loginPath="/rider/login" title="URBANOVA rider" />}

      {adding && (
        <form onSubmit={addRider} className="grid gap-3 border border-gray-200 bg-white p-5 sm:grid-cols-2">
          <input className={inputClass} placeholder="Full name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className={inputClass} placeholder="Phone" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <input className={inputClass} placeholder="Login email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <input className={inputClass} placeholder="Vehicle (optional), e.g. Motorbike GR-1234-24" value={form.vehicle} onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))} />
          {error && <p className="text-sm font-body text-brand-red sm:col-span-2" role="alert">{error}</p>}
          <button type="submit" className="bg-brand-black px-4 py-2 text-xs font-body uppercase tracking-wider text-white sm:col-span-2 sm:justify-self-start">
            Create rider login
          </button>
        </form>
      )}

      {loading ? (
        <p className="font-body text-sm text-gray-500">Loading…</p>
      ) : riders.length === 0 ? (
        <p className="font-body text-sm text-gray-500">No riders yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 bg-white font-body text-sm">
          {riders.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-brand-black">
                  {r.name}{' '}
                  {r.status === 'suspended' && <span className="ml-1 bg-gray-200 px-1.5 py-0.5 text-[10px] uppercase text-gray-700">Suspended</span>}
                </p>
                <p className="text-gray-500">
                  {r.phone} · {r.email}
                  {r.vehicle ? ` · ${r.vehicle}` : ''}
                </p>
                <p className="text-xs text-gray-400">{r.lastLoginAt ? `Last login ${r.lastLoginAt.slice(0, 10)}` : 'Never logged in'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => resetPassword(r)} className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50">
                  Reset password
                </button>
                <button
                  onClick={() => setStatus(r, r.status === 'active' ? 'suspended' : 'active')}
                  className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50"
                >
                  {r.status === 'active' ? 'Suspend' : 'Reactivate'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
