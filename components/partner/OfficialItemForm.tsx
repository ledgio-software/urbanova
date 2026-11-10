'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/format'

// A stockist's listing of an official URBANOVA item: name, photos and description come from URBANOVA;
// the stockist sets their price, how many of each size they have, and whether it shows.

export interface OfficialItemRow {
  id?: string // already in the stockist's listing
  sourceVariantId?: string // a size of the URBANOVA item not yet listed
  size: string
  color: string
  stock: string
}

interface Props {
  productId?: string // edit mode
  sourceProductId?: string // add mode
  name: string
  imageUrl: string | null
  urbanovaPrice: number // pesewas — URBANOVA's own price, as a guide
  initial: { price: string; isActive: boolean; rows: OfficialItemRow[] }
}

const inputClass =
  'w-full border border-gray-300 bg-white px-3 py-2 text-sm font-body text-brand-black focus:border-brand-black focus:outline-none'
const labelClass = 'block text-xs font-body uppercase tracking-widest text-gray-500 mb-1.5'

export function OfficialItemForm({ productId, sourceProductId, name, imageUrl, urbanovaPrice, initial }: Props) {
  const router = useRouter()
  const [price, setPrice] = useState(initial.price)
  const [isActive, setIsActive] = useState(initial.isActive)
  const [rows, setRows] = useState(initial.rows)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const variants = rows
      // New sizes are only added when the stockist actually has some
      .filter((r) => r.id || Number(r.stock) > 0)
      .map((r) => (r.id ? { id: r.id, stockQuantity: Number(r.stock) || 0 } : { sourceVariantId: r.sourceVariantId!, stockQuantity: Number(r.stock) || 0 }))
    if (variants.length === 0) {
      setError('Enter how many you have of at least one size')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(productId ? `/api/partner/products/${productId}` : '/api/partner/products/official', {
        method: productId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(productId ? {} : { sourceProductId }), basePrice: Math.round(Number(price) * 100), isActive, variants }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Could not save')
        return
      }
      router.push('/partner/products')
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <section className="flex gap-4 border border-gray-200 bg-white p-5">
        <div className="h-24 w-24 shrink-0 overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {imageUrl && <img src={imageUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 font-body">
          <span className="bg-brand-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Official URBANOVA</span>
          <p className="mt-2 font-semibold text-brand-black">{name}</p>
          <p className="mt-1 text-xs text-gray-500">
            Name, photos and description come from URBANOVA and update automatically. URBANOVA&apos;s price: {formatPrice(urbanovaPrice)}.
          </p>
        </div>
      </section>

      <section className="space-y-4 border border-gray-200 bg-white p-5">
        <label className="block max-w-xs">
          <span className={labelClass}>Your price (GHS)</span>
          <input className={inputClass} type="number" min={1} step={0.01} required value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <div>
          <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Your stock</h2>
          <p className="text-xs font-body text-gray-500">How many of each size you have in your shop. Leave 0 for sizes you don&apos;t have.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rows.map((r, i) => (
            <label key={r.id ?? r.sourceVariantId} className="block" data-testid="stock-row">
              <span className={labelClass}>{[r.size, r.color].filter(Boolean).join(' · ')}</span>
              <input
                className={inputClass}
                type="number"
                min={0}
                max={100000}
                value={r.stock}
                onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)))}
              />
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 font-body text-sm text-brand-black">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Show this item in my shop
        </label>
      </section>

      {error && <p className="font-body text-sm text-brand-red" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-brand-red px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-wider text-white hover:bg-brand-red/90 disabled:opacity-50"
      >
        {saving ? 'Saving…' : productId ? 'Save changes' : 'Add to my shop'}
      </button>
    </form>
  )
}
