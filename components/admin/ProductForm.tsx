'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string }

type VariantData = {
  id?: string
  sku?: string
  size: string
  color: string
  stockQuantity: number
}

type ProductData = {
  id: string
  name: string
  slug: string
  categoryId: string
  description: string
  basePrice: number
  featured: boolean
  tags: string[]
  images?: { id?: string; url: string; sortOrder?: number }[]
  variants?: VariantData[]
}

type Props = {
  categories: Category[]
  product?: ProductData
}

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
    description: product?.description ?? '',
    basePrice: product ? (product.basePrice / 100).toFixed(2) : '',
    featured: product?.featured ?? false,
    tags: product?.tags?.join(', ') ?? '',
  })

  const [images, setImages] = useState<string[]>(
    product?.images?.map((i) => i.url) ?? []
  )
  const [variants, setVariants] = useState<VariantData[]>(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        stockQuantity: v.stockQuantity,
      }))
    }
    return DEFAULT_SIZES.map((size) => ({
      size,
      color: 'Midnight City',
      stockQuantity: 10,
    }))
  })

  const [imageUrlInput, setImageUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Failed to upload image')
        }

        const data = await res.json()
        if (data.url) {
          setImages((prev) => [...prev, data.url])
        }
      }
    } catch (err: any) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function handleAddImageUrl() {
    const trimmed = imageUrlInput.trim()
    if (!trimmed) return
    if (images.includes(trimmed)) {
      setError('This image URL is already added.')
      return
    }
    setImages((prev) => [...prev, trimmed])
    setImageUrlInput('')
    setError(null)
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return
    setImages((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  function updateVariant(index: number, field: keyof VariantData, value: string | number) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { size: 'M', color: 'Midnight City', stockQuantity: 10 },
    ])
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      categoryId: form.categoryId,
      description: form.description,
      basePrice: Math.round(parseFloat(form.basePrice) * 100),
      featured: form.featured,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: images,
      variants: variants,
    }

    const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
    const method = product ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSubmitting(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error?.message ?? 'Something went wrong.')
      return
    }
    router.push('/admin/products')
    router.refresh()
  }

  async function handleDelete() {
    if (!product || !confirm('Delete this product? This cannot be undone.')) return
    await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <Field label="Name" name="name" value={form.name} onChange={handleChange} required />
      <Field
        label="Slug (URL)"
        name="slug"
        value={form.slug || slugify(form.name)}
        onChange={handleChange}
        placeholder="auto-generated"
        pattern="^[a-z0-9-]+$"
      />

      <div>
        <label className="block text-xs font-body uppercase tracking-widest text-gray-500 mb-2">Category</label>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
          className="w-full border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-brand-black"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-body uppercase tracking-widest text-gray-500 mb-2">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-brand-black resize-none"
        />
      </div>

      <Field label="Base Price (GHS)" name="basePrice" type="number" value={form.basePrice} onChange={handleChange} required placeholder="e.g. 120.00" />
      <Field label="Tags (comma-separated)" name="tags" value={form.tags} onChange={handleChange} placeholder="streetwear, limited" />

      {/* Product Images Section */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <label className="block text-xs font-body uppercase tracking-widest text-gray-500">
          Product Images ({images.length})
        </label>

        {/* Upload File Box */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center hover:border-brand-black transition-colors relative bg-gray-50/50">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          />
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-body text-gray-700 font-medium">
              {uploading ? 'Uploading image(s)...' : 'Click or drag images to upload'}
            </span>
            <span className="text-[11px] font-body text-gray-400">Supports PNG, JPG, WEBP, GIF</span>
          </div>
        </div>

        {/* Add via URL */}
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddImageUrl()
              }
            }}
            placeholder="Or paste image URL (https://...)"
            className="flex-1 border border-gray-200 px-3 py-2 text-xs font-body focus:outline-none focus:border-brand-black"
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="bg-gray-100 text-brand-black border border-gray-200 px-3 py-2 text-xs font-body uppercase tracking-wider font-semibold hover:bg-gray-200 transition-colors"
          >
            Add URL
          </button>
        </div>

        {/* Thumbnail Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
            {images.map((url, idx) => (
              <div key={idx} className="relative aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-brand-black text-white text-[9px] font-body px-1.5 py-0.5 uppercase tracking-wider rounded">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition-opacity z-10"
                  title="Remove image"
                >
                  ×
                </button>
                {images.length > 1 && (
                  <div className="absolute bottom-1 right-1 flex gap-1 bg-black/70 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx - 1)}
                        className="text-white text-[11px] px-1 hover:text-brand-red font-bold"
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx + 1)}
                        className="text-white text-[11px] px-1 hover:text-brand-red font-bold"
                        title="Move right"
                      >
                        →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inventory & Size Variants Section */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-body uppercase tracking-widest text-gray-500">
            Inventory Stock per Variant ({variants.length})
          </label>
          <button
            type="button"
            onClick={addVariant}
            className="text-xs font-body text-brand-red uppercase tracking-wider font-semibold hover:underline"
          >
            + Add Variant
          </button>
        </div>

        <div className="space-y-2">
          {variants.map((v, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded border border-gray-200 text-xs font-body">
              <div className="w-20">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Size</label>
                <input
                  type="text"
                  value={v.size}
                  onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                  className="w-full border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:border-brand-black uppercase font-semibold text-center"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Color</label>
                <input
                  type="text"
                  value={v.color}
                  onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                  className="w-full border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:border-brand-black"
                  required
                />
              </div>
              <div className="w-24">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Stock Qty</label>
                <input
                  type="number"
                  min="0"
                  value={v.stockQuantity}
                  onChange={(e) => updateVariant(idx, 'stockQuantity', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:border-brand-black font-semibold text-center"
                  required
                />
              </div>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="text-red-500 hover:text-red-700 px-1 pt-3 font-bold text-sm"
                  title="Remove variant"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          name="featured"
          id="featured"
          checked={form.featured}
          onChange={handleChange}
          className="accent-brand-red w-4 h-4"
        />
        <label htmlFor="featured" className="text-sm font-body text-gray-700">Featured on homepage</label>
      </div>

      {error && <p className="text-brand-red text-sm font-body">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-1 bg-brand-black text-white font-body text-sm uppercase tracking-widest py-3 hover:bg-brand-black/80 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
        </button>
        {product && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-3 border border-red-200 text-red-500 font-body text-sm hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}

function Field({
  label, name, value, onChange, type = 'text', required, placeholder, pattern,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
  pattern?: string
}) {
  return (
    <div>
      <label className="block text-xs font-body uppercase tracking-widest text-gray-500 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        step={type === 'number' ? '0.01' : undefined}
        className="w-full border border-gray-200 px-3 py-2.5 text-sm font-body focus:outline-none focus:border-brand-black"
      />
    </div>
  )
}
