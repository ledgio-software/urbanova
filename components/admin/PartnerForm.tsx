'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageUploadField } from '@/components/dashboard/ImageUploadField'
import { OneTimePassword } from './OneTimePassword'
import { PARTNER_TYPES, PAYOUT_METHODS, slugify } from '@/lib/partners'

export interface PartnerFormValues {
  name: string
  slug: string
  status: 'pending' | 'active' | 'suspended'
  type: 'market' | 'stockist'
  customDomain: string
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
  type: 'market',
  customDomain: '',
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

export function PartnerForm({
  mode,
  partnerId,
  initial,
  rootDomain,
}: {
  mode: 'new' | 'edit'
  partnerId?: string
  initial: PartnerFormValues
  rootDomain?: string // PARTNER_ROOT_DOMAIN, for showing the free sub-address
}) {
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
      commissionPercent: values.type === 'stockist' || values.commissionPercent === '' ? null : Number(values.commissionPercent),
      payoutMethod: values.payoutMethod || null,
      customDomain: values.customDomain.trim() || null,
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
        <fieldset>
          <legend className={labelClass}>Partner type</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {PARTNER_TYPES.map((t) => (
              <label
                key={t.value}
                className={`flex cursor-pointer gap-3 border p-3 ${values.type === t.value ? 'border-brand-black bg-gray-50' : 'border-gray-200'}`}
              >
                <input type="radio" name="partner-type" value={t.value} checked={values.type === t.value} onChange={() => set('type', t.value)} className="mt-1" />
                <span>
                  <span className="block font-body text-sm font-semibold text-brand-black">{t.label}</span>
                  <span className="block font-body text-xs text-gray-500">{t.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
          {values.type === 'market' ? (
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
          ) : (
            <Field label="URBANOVA commission">
              <p className="py-2 font-body text-sm text-gray-700">None — stockists keep all their sales.</p>
            </Field>
          )}
        </div>
      </Card>

      <Card title="Website">
        <p className="text-xs font-body text-gray-500">
          {rootDomain ? (
            <>
              Free address: <span className="font-mono">{(mode === 'edit' ? initial.slug : values.slug) || 'shop-name'}.{rootDomain}</span> — works as soon as the partner is live.
            </>
          ) : (
            <>Free addresses (shop-name.yourdomain) switch on once URBANOVA&apos;s domain is set as PARTNER_ROOT_DOMAIN.</>
          )}
        </p>
        <Field label="Partner's own domain (optional)" hint="If they bought one, e.g. kumasidrip.com. Leave empty if not.">
          <input className={inputClass} value={values.customDomain} placeholder="kumasidrip.com" onChange={(e) => set('customDomain', e.target.value)} />
        </Field>
        {values.customDomain.trim() && (
          <ol className="list-decimal space-y-1 pl-5 text-xs font-body text-gray-600" data-testid="dns-steps">
            <li>In Vercel → urbanova → Settings → Domains, add <span className="font-mono">{values.customDomain.trim().replace(/^www\./, '')}</span> and <span className="font-mono">www.{values.customDomain.trim().replace(/^www\./, '')}</span>.</li>
            <li>Where the domain was bought, add the DNS records Vercel shows — usually an <span className="font-mono">A</span> record for <span className="font-mono">@</span> → <span className="font-mono">76.76.21.21</span> and a <span className="font-mono">CNAME</span> for <span className="font-mono">www</span> → <span className="font-mono">cname.vercel-dns.com</span>.</li>
            <li>It can take up to a few hours to start working. Vercel shows a green tick when it&apos;s connected.</li>
          </ol>
        )}
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

      <Card title={values.type === 'stockist' ? 'Customer payments' : 'Payouts'}>
        <p className="text-xs font-body text-gray-500">
          {values.type === 'stockist'
            ? 'Customers pay the stockist directly to this account — it is shown at checkout. Required before going live.'
            : 'Where URBANOVA sends the partner\u2019s share of each sale.'}
        </p>
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
