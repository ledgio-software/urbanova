'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ChangePasswordForm({
  firstLogin,
  minLength,
  endpoint = '/api/partner/password',
  home = '/partner',
}: {
  firstLogin: boolean
  minLength: number
  endpoint?: string
  home?: string
}) {
  const router = useRouter()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.newPassword !== form.confirm) {
      setError('The new passwords don’t match')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not change password')
        return
      }
      setDone(true)
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
      if (firstLogin) {
        router.push(home)
        router.refresh()
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full border border-gray-300 bg-white px-3 py-2 text-sm font-body focus:border-brand-black focus:outline-none'

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4 border border-gray-200 bg-white p-5">
      {(['currentPassword', 'newPassword', 'confirm'] as const).map((key) => (
        <label key={key} className="block">
          <span className="mb-1.5 block text-xs font-body uppercase tracking-widest text-gray-500">
            {key === 'currentPassword' ? (firstLogin ? 'Temporary password' : 'Current password') : key === 'newPassword' ? 'New password' : 'Confirm new password'}
          </span>
          <input
            type="password"
            required
            minLength={key === 'currentPassword' ? 1 : minLength}
            autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className={inputClass}
          />
        </label>
      ))}
      <p className="text-xs font-body text-gray-400">At least {minLength} characters.</p>
      {error && <p className="text-sm font-body text-brand-red" role="alert">{error}</p>}
      {done && !firstLogin && <p className="text-sm font-body text-green-700">Password changed.</p>}
      <button type="submit" disabled={saving} className="bg-brand-red px-5 py-2.5 text-xs font-body font-semibold uppercase tracking-wider text-white hover:bg-brand-red/90 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save password'}
      </button>
    </form>
  )
}
