'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoCropper } from '@/components/dashboard/PhotoCropper'
import { PhotoGuide } from '@/components/dashboard/PhotoGuide'

export interface VariantRow {
  id?: string
  size: string
  color: string
  stock: string
  price: string // optional override, GHS
}

export interface PartnerProductValues {
  name: string
  categoryId: string
  price: string // GHS
  description: string
  isActive: boolean
  images: string[]
  variants: VariantRow[]
}

const inputClass = 'w-full border border-gray-300 bg-white px-3 py-2 text-sm font-body focus:border-brand-black focus:outline-none'
const labelClass = 'mb-1.5 block text-xs font-body uppercase tracking-widest text-gray-500'
const toPesewas = (ghs: string) => Math.round(parseFloat(ghs) * 100)

export function PartnerProductForm({
  productId,
  initial,
  categories,
}: {
  productId?: string
  initial: PartnerProductValues
  categories: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof PartnerProductValues>(k: K, value: PartnerProductValues[K]) => setV((p) => ({ ...p, [k]: value }))
  const setRow = (i: number, k: keyof VariantRow, value: string) =>
    setV((p) => ({ ...p, variants: p.variants.map((r, j) => (j === i ? { ...r, [k]: value } : r)) }))

  // Chosen photos are fitted to the portrait frame one by one (PhotoCropper), then uploaded
  const [cropQueue, setCropQueue] = useState<{ files: File[]; total: number }>({ files: [], total: 0 })

  function choose(files: FileList | null) {
    if (!files?.length) return
    setError(null)
    const picked = Array.from(files).slice(0, 6 - v.images.length)
    setCropQueue({ files: picked, total: picked.length })
  }

  const nextPhoto = () => setCropQueue((q) => ({ ...q, files: q.files.slice(1) }))

  async function upload(file: File) {
    nextPhoto()
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/partner/upload', { method: 'POST', body: form })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed')
      setV((p) => ({ ...p, images: [...p.images, data.url!] }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const payload = {
      name: v.name,
      categoryId: v.categoryId,
      basePrice: toPesewas(v.price),
      description: v.description,
      isActive: v.isActive,
      images: v.images,
      variants: v.variants.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        size: r.size,
        color: r.color,
        stockQuantity: parseInt(r.stock || '0', 10),
        priceOverride: r.price.trim() ? toPesewas(r.price) : null,
      })),
    }
    try {
      const res = await fetch(productId ? `/api/partner/products/${productId}` : '/api/partner/products', {
        method: productId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
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

  async function remove() {
    if (!productId || !confirm('Delete this product? This can’t be undone.')) return
    const res = await fetch(`/api/partner/products/${productId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Could not delete')
      return
    }
    router.push('/partner/products')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <section className="space-y-4 border border-gray-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>Product name</span>
            <input className={inputClass} required maxLength={80} value={v.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label className="block">
            <span className={labelClass}>Category</span>
            <select className={inputClass} required value={v.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
              <option value="">Choose…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Price (GHS)</span>
            <input className={inputClass} type="number" min={1} step={0.01} required value={v.price} onChange={(e) => set('price', e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Description</span>
            <textarea className={`${inputClass} min-h-28`} required minLength={10} maxLength={2000} value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="What it is, what it's made of, sizing or care notes." />
          </label>
        </div>
      </section>

      <section className="space-y-3 border border-gray-200 bg-white p-5">
        <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Photos</h2>
        <p className="text-xs font-body text-gray-500">1–6 photos. The first one is the main photo. JPG, PNG or WebP, up to 5 MB each.</p>
        <PhotoGuide />
        {cropQueue.files[0] && (
          <PhotoCropper
            key={`${cropQueue.total}-${cropQueue.files.length}`}
            file={cropQueue.files[0]}
            position={{ current: cropQueue.total - cropQueue.files.length + 1, total: cropQueue.total }}
            onDone={upload}
            onCancel={nextPhoto}
          />
        )}
        <div className="flex flex-wrap gap-3">
          {v.images.map((url, i) => (
            <div key={url + i} className="relative h-32 w-24 overflow-hidden border border-gray-200 bg-brand-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-contain" />
              {i === 0 && <span className="absolute left-0 top-0 bg-brand-black px-1 text-[9px] uppercase text-white">Main</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 text-[10px] text-white">
                <button type="button" disabled={i === 0} onClick={() => set('images', [v.images[i], ...v.images.filter((_, j) => j !== i)])} className="px-1 disabled:opacity-30">Main</button>
                <button type="button" onClick={() => set('images', v.images.filter((_, j) => j !== i))} className="px-1" aria-label="Remove photo">✕</button>
              </div>
            </div>
          ))}
          {v.images.length < 6 && (
            <label className="flex h-32 w-24 cursor-pointer items-center justify-center border border-dashed border-gray-400 text-xs uppercase tracking-wider text-gray-500 hover:bg-gray-50">
              {uploading ? '…' : '+ Photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={(e) => {
                  choose(e.target.files)
                  e.target.value = '' // the same photo can be picked again
                }} />
            </label>
          )}
        </div>
      </section>

      <section className="space-y-3 border border-gray-200 bg-white p-5">
        <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Options & stock</h2>
        <p className="text-xs font-body text-gray-500">
          One row per option a customer can choose (e.g. size or colour). Selling just one kind? Keep a single row. Leave price empty to use the main price.
        </p>
        <div className="space-y-2">
          {v.variants.map((r, i) => (
            <div key={r.id ?? `new-${i}`} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_90px_110px_auto] sm:items-end" data-testid="variant-row">
              <label className="block"><span className={labelClass}>Size / type</span><input className={inputClass} value={r.size} placeholder="One size" onChange={(e) => setRow(i, 'size', e.target.value)} /></label>
              <label className="block"><span className={labelClass}>Colour</span><input className={inputClass} value={r.color} placeholder="Standard" onChange={(e) => setRow(i, 'color', e.target.value)} /></label>
              <label className="block"><span className={labelClass}>Stock</span><input className={inputClass} type="number" min={0} required value={r.stock} onChange={(e) => setRow(i, 'stock', e.target.value)} /></label>
              <label className="block"><span className={labelClass}>Price (opt.)</span><input className={inputClass} type="number" min={1} step={0.01} value={r.price} onChange={(e) => setRow(i, 'price', e.target.value)} /></label>
              <button type="button" disabled={v.variants.length === 1} onClick={() => set('variants', v.variants.filter((_, j) => j !== i))} className="py-2 text-xs uppercase tracking-wider text-gray-500 underline disabled:opacity-30">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set('variants', [...v.variants, { size: '', color: '', stock: '0', price: '' }])} className="text-xs font-body uppercase tracking-wider text-brand-red">
          + Add option
        </button>
      </section>

      <label className="flex items-center gap-3 font-body text-sm">
        <input type="checkbox" checked={v.isActive} onChange={(e) => set('isActive', e.target.checked)} className="h-4 w-4" />
        Show this product on Nova Market
      </label>

      {error && <p className="text-sm font-body text-brand-red" role="alert">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving || uploading} className="bg-brand-red px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-wider text-white hover:bg-brand-red/90 disabled:opacity-50">
          {saving ? 'Saving…' : productId ? 'Save changes' : 'Add product'}
        </button>
        {productId && (
          <button type="button" onClick={remove} className="border border-red-200 px-4 py-2.5 text-xs font-body uppercase tracking-wider text-brand-red hover:bg-red-50">
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
