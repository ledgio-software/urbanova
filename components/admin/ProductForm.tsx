'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string }

type ProductData = {
  id: string
  name: string
  slug: string
  categoryId: string
  description: string
  basePrice: number
  featured: boolean
  tags: string[]
}

type Props = {
  categories: Category[]
  product?: ProductData
}

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
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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

      <div className="flex items-center gap-3">
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
          disabled={submitting}
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
