'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUploadField } from '@/components/dashboard/ImageUploadField'
import { PAYOUT_METHODS } from '@/lib/partners'

export interface PartnerProfileValues {
  tagline: string
  description: string
  logoUrl: string | null
  bannerUrl: string | null
  contactEmail: string
  contactPhone: string
  location: string
  payoutMethod: string
  payoutAccountName: string
  payoutAccountNumber: string
}

const inputClass = 'w-full border border-gray-300 bg-white px-3 py-2 text-sm font-body focus:border-brand-black focus:outline-none'
const labelClass = 'mb-1.5 block text-xs font-body uppercase tracking-widest text-gray-500'

export function PartnerProfileForm({ initial }: { initial: PartnerProfileValues }) {
  const router = useRouter()
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof PartnerProfileValues>(key: K, value: PartnerProfileValues[K]) => {
    setSaved(false)
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/partner/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, payoutMethod: values.payoutMethod || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        const fields = data.error?.fieldErrors as Record<string, string[]> | undefined
        const first = fields && Object.values(fields).find((m) => m?.length)
        setError(typeof data.error === 'string' ? data.error : first?.[0] ?? 'Please check the form')
        return
      }
      setSaved(true)
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <section className="space-y-4 border border-gray-200 bg-white p-5">
        <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Your page</h2>
        <label className="block">
          <span className={labelClass}>Tagline</span>
          <input className={inputClass} value={values.tagline} maxLength={120} onChange={(e) => set('tagline', e.target.value)} placeholder="One line about what you do" />
        </label>
        <label className="block">
          <span className={labelClass}>About</span>
          <textarea className={`${inputClass} min-h-32`} value={values.description} maxLength={2000} onChange={(e) => set('description', e.target.value)} placeholder="Your story, what you make or sell, what makes it yours." />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField label="Logo" value={values.logoUrl} onChange={(url) => set('logoUrl', url)} uploadUrl="/api/partner/upload" hint="Square, JPG/PNG/WebP, up to 5 MB" />
          <ImageUploadField label="Banner" value={values.bannerUrl} onChange={(url) => set('bannerUrl', url)} uploadUrl="/api/partner/upload" aspect="wide" hint="Wide photo, up to 5 MB" />
        </div>
      </section>

      <section className="space-y-4 border border-gray-200 bg-white p-5">
        <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Email</span>
            <input className={inputClass} type="email" required value={values.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
          </label>
          <label className="block">
            <span className={labelClass}>Phone / WhatsApp</span>
            <input className={inputClass} required value={values.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
          </label>
          <label className="block">
            <span className={labelClass}>Location</span>
            <input className={inputClass} value={values.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Osu, Accra" />
          </label>
        </div>
      </section>

      <section className="space-y-4 border border-gray-200 bg-white p-5">
        <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Payouts</h2>
        <p className="text-xs font-body text-gray-500">Where URBANOVA sends your share of each sale.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={labelClass}>Method</span>
            <select className={inputClass} value={values.payoutMethod} onChange={(e) => set('payoutMethod', e.target.value)}>
              <option value="">Choose…</option>
              {PAYOUT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Account name</span>
            <input className={inputClass} value={values.payoutAccountName} onChange={(e) => set('payoutAccountName', e.target.value)} />
          </label>
          <label className="block">
            <span className={labelClass}>Number</span>
            <input className={inputClass} value={values.payoutAccountNumber} onChange={(e) => set('payoutAccountNumber', e.target.value)} />
          </label>
        </div>
      </section>

      {error && <p className="text-sm font-body text-brand-red" role="alert">{error}</p>}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="bg-brand-red px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-wider text-white hover:bg-brand-red/90 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="text-sm font-body text-green-700">Saved</span>}
      </div>
    </form>
  )
}
