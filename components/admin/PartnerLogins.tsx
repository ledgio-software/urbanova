'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OneTimePassword } from './OneTimePassword'

interface LoginRow {
  id: string
  name: string
  email: string
  mustChangePassword: boolean
  lastLoginAt: string | null
}

// Logins for one partner: add another person, or reset a forgotten password.
export function PartnerLogins({ partnerId, users, phone }: { partnerId: string; users: LoginRow[]; phone: string }) {
  const router = useRouter()
  const [form, setForm] = useState({ userName: '', userEmail: '' })
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issued, setIssued] = useState<{ email: string; tempPassword: string } | null>(null)

  async function call(url: string, body?: unknown) {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Please check the name and email')
        return
      }
      setIssued(data.login)
      setAdding(false)
      setForm({ userName: '', userEmail: '' })
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="max-w-3xl space-y-4 border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Dashboard logins</h2>
        <button type="button" onClick={() => setAdding((a) => !a)} className="text-xs font-body uppercase tracking-wider text-brand-red">
          {adding ? 'Cancel' : '+ Add login'}
        </button>
      </div>

      {issued && <OneTimePassword email={issued.email} password={issued.tempPassword} phone={phone} />}

      <ul className="divide-y divide-gray-100 font-body text-sm">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <p className="font-semibold text-brand-black">{u.name}</p>
              <p className="text-gray-500">{u.email}</p>
              <p className="text-xs text-gray-400">
                {u.lastLoginAt ? `Last login ${u.lastLoginAt.slice(0, 10)}` : 'Never logged in'}
                {u.mustChangePassword && ' · must set own password'}
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (confirm(`Reset the password for ${u.email}? Their current password will stop working.`)) {
                  call(`/api/admin/partners/${partnerId}/users/${u.id}/reset-password`)
                }
              }}
              className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset password
            </button>
          </li>
        ))}
      </ul>

      {adding && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            call(`/api/admin/partners/${partnerId}/users`, form)
          }}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <input
            className="border border-gray-300 px-3 py-2 text-sm font-body"
            placeholder="Name"
            value={form.userName}
            required
            onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
          />
          <input
            className="border border-gray-300 px-3 py-2 text-sm font-body"
            type="email"
            placeholder="Email"
            value={form.userEmail}
            required
            onChange={(e) => setForm((f) => ({ ...f, userEmail: e.target.value }))}
          />
          <button type="submit" disabled={busy} className="bg-brand-black px-4 py-2 text-xs font-body uppercase tracking-wider text-white disabled:opacity-50">
            Create login
          </button>
        </form>
      )}
      {error && <p className="font-body text-sm text-brand-red" role="alert">{error}</p>}
    </section>
  )
}
