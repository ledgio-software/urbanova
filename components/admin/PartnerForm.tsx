'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageUploadField } from '@/components/dashboard/ImageUploadField'
import { OneTimePassword } from './OneTimePassword'
import { PAYOUT_METHODS, slugify } from '@/lib/partners'

export interface PartnerFormValues {
  name: string
  slug: string
  status: 'pending' | 'active' | 'suspended'
  commissionPercent: string
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

export const EMPTY_PARTNER: PartnerFormValues = {
  name: '',
  slug: '',
  status: 'pending',
  commissionPercent: '',
  tagline: '',
  description: '',
  logoUrl: null,
  bannerUrl: null,
  contactEmail: '',
  contactPhone: '',
  location: '',
  payoutMethod: '',
  payoutAccountName: '',
  payoutAccountNumber: '',
}

const inputClass =
  'w-full border border-gray-300 bg-white px-3 py-2 text-sm font-body text-brand-black focus:border-brand-black focus:outline-none'
const labelClass = 'block text-xs font-body uppercase tracking-widest text-gray-500 mb-1.5'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs font-body text-gray-400">{hint}</span>}
    </label>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border border-gray-200 bg-white p-5">
      <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">{title}</h2>
      {children}
    </section>
  )
}

type ApiError = { error?: string | { fieldErrors?: Record<string, string[]>; formErrors?: string[] } }

function errorMessage(data: ApiError): string {
  if (typeof data.error === 'string') return data.error
  const fields = data.error?.fieldErrors ?? {}
  const first = Object.entries(fields).find(([, msgs]) => msgs?.length)
  if (first) return `${first[0]}: ${first[1][0]}`
  return data.error?.formErrors?.[0] ?? 'Something went wrong'
}

export function PartnerForm({ mode, partnerId, initial }: { mode: 'new' | 'edit'; partnerId?: string; initial: PartnerFormValues }) {
  const router = useRouter()
  const [values, setValues] = useState(initial)
  const [login, setLogin] = useState({ userName: '', userEmail: '' })
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [created, setCreated] = useState<{ id: string; email: string; tempPassword: string } | null>(null)

  const set = <K extends keyof PartnerFormValues>(key: K, value: PartnerFormValues[K]) => {
    setSaved(false)
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const payload = {
      ...values,
      commissionPercent: values.commissionPercent === '' ? null : Number(values.commissionPercent),
      payoutMethod: values.payoutMethod || null,
      ...(mode === 'new' ? login : {}),
    }
    try {
      const res = await fetch(mode === 'new' ? '/api/admin/partners' : `/api/admin/partners/${partnerId}`, {
        method: mode === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(errorMessage(data))
        return
      }
      if (mode === 'new') {
        setCreated({ id: data.id, email: data.login.email, tempPassword: data.login.tempPassword })
      } else {
        setSaved(true)
        router.refresh()
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  if (created) {
    return (
      <div className="max-w-2xl space-y-4">
        <p className="font-body text-sm text-gray-700">
          <strong>{values.name}</strong> has been created as <strong>{values.status === 'active' ? 'live' : values.status}</strong>.
        </p>
        <OneTimePassword email={created.email} password={created.tempPassword} phone={values.contactPhone} />
        <div className="flex gap-3">
          <Link href={`/admin/partners/${created.id}`} className="bg-brand-black px-4 py-2 text-xs font-body uppercase tracking-wider text-white">
            Open partner
          </Link>
          <Link href="/admin/partners" className="border border-gray-300 px-4 py-2 text-xs font-body uppercase tracking-wider text-gray-700">
            All partners
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <Card title="Partner">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name">
            <input
              className={inputClass}
              value={values.name}
              required
              onChange={(e) => {
                set('name', e.target.value)
                if (!slugTouched) set('slug', slugify(e.target.value))
              }}
            />
          </Field>
          <Field label="Page address" hint={`urbanova site/partners/${values.slug || 'shop-name'}`}>
            <input
              className={inputClass}
              value={values.slug}
              required
              onChange={(e) => {
                setSlugTouched(true)
                set('slug', e.target.value.toLowerCase())
              }}
            />
          </Field>
          <Field label="Status" hint="Live = public page and products visible. Suspended = hidden and logins blocked.">
            <select className={inputClass} value={values.status} onChange={(e) => set('status', e.target.value as PartnerFormValues['status'])}>
              <option value="pending">Pending (not live)</option>
              <option value="active">Live</option>
              <option value="suspended">Suspended</option>
            </select>
          </Field>
          <Field label="URBANOVA commission (%)" hint="Required before going live. Taken from each sale.">
            <input
              className={inputClass}
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={values.commissionPercent}
              onChange={(e) => set('commissionPercent', e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {mode === 'new' && (
        <Card title="Dashboard login">
          <p className="text-xs font-body text-gray-500">
            The partner logs in at <span className="font-mono">/partner/login</span>. You&apos;ll get a one-time password to share; they set their own on first login.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Person's name">
              <input className={inputClass} value={login.userName} required onChange={(e) => setLogin((l) => ({ ...l, userName: e.target.value }))} />
            </Field>
            <Field label="Login email">
              <input className={inputClass} type="email" value={login.userEmail} required onChange={(e) => setLogin((l) => ({ ...l, userEmail: e.target.value }))} />
            </Field>
          </div>
        </Card>
      )}

      <Card title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact email">
            <input className={inputClass} type="email" value={values.contactEmail} required onChange={(e) => set('contactEmail', e.target.value)} />
          </Field>
          <Field label="Phone / WhatsApp">
            <input className={inputClass} value={values.contactPhone} required onChange={(e) => set('contactPhone', e.target.value)} />
          </Field>
          <Field label="Location">
            <input className={inputClass} value={values.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Osu, Accra" />
          </Field>
        </div>
      </Card>

      <Card title="Page">
        <Field label="Tagline">
          <input className={inputClass} value={values.tagline} maxLength={120} onChange={(e) => set('tagline', e.target.value)} />
        </Field>
        <Field label="About">
          <textarea className={`${inputClass} min-h-28`} value={values.description} maxLength={2000} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField label="Logo" value={values.logoUrl} onChange={(url) => set('logoUrl', url)} uploadUrl="/api/admin/upload" />
          <ImageUploadField label="Banner" value={values.bannerUrl} onChange={(url) => set('bannerUrl', url)} uploadUrl="/api/admin/upload" aspect="wide" />
        </div>
      </Card>

      <Card title="Payouts">
        <p className="text-xs font-body text-gray-500">Where URBANOVA sends the partner&apos;s share of each sale.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Method">
            <select className={inputClass} value={values.payoutMethod} onChange={(e) => set('payoutMethod', e.target.value)}>
              <option value="">Not set</option>
              {PAYOUT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Account name">
            <input className={inputClass} value={values.payoutAccountName} onChange={(e) => set('payoutAccountName', e.target.value)} />
          </Field>
          <Field label="Number">
            <input className={inputClass} value={values.payoutAccountNumber} onChange={(e) => set('payoutAccountNumber', e.target.value)} />
          </Field>
        </div>
      </Card>

      {error && <p className="font-body text-sm text-brand-red" role="alert">{error}</p>}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-red px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-wider text-white hover:bg-brand-red/90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : mode === 'new' ? 'Create partner' : 'Save changes'}
        </button>
        {saved && <span className="font-body text-sm text-green-700">Saved</span>}
      </div>
    </form>
  )
}
