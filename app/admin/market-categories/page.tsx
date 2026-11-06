'use client'

import { useEffect, useState } from 'react'

type Cat = { id: string; name: string; slug: string; _count: { products: number } }

export default function MarketCategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/admin/market-categories')
      setCats(await res.json())
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function create(body: object) {
    setError(null)
    const res = await fetch('/api/admin/market-categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Could not add')
    else setName('')
    load()
  }

  async function rename(c: Cat) {
    const next = prompt('New name', c.name)
    if (!next || next === c.name) return
    const res = await fetch(`/api/admin/market-categories/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: next }) })
    if (!res.ok) setError((await res.json()).error ?? 'Could not rename')
    load()
  }

  async function remove(c: Cat) {
    if (!confirm(`Delete “${c.name}”?`)) return
    const res = await fetch(`/api/admin/market-categories/${c.id}`, { method: 'DELETE' })
    if (!res.ok) setError((await res.json()).error ?? 'Could not delete')
    load()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Market Categories</h1>
        <p className="mt-1 text-xs font-body text-gray-500">Categories partners choose for their Nova Market products. URBANOVA&apos;s own Shop categories aren&apos;t affected.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          create({ name })
        }}
        className="flex gap-2"
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category, e.g. Sneakers" required minLength={2} maxLength={40} className="flex-1 border border-gray-300 px-3 py-2 text-sm font-body" />
        <button type="submit" className="bg-brand-red px-4 py-2 text-xs font-body font-semibold uppercase tracking-wider text-white">Add</button>
      </form>
      {error && <p className="text-sm font-body text-brand-red" role="alert">{error}</p>}

      {loading ? (
        <p className="font-body text-sm text-gray-500">Loading…</p>
      ) : cats.length === 0 ? (
        <div className="space-y-3 border border-gray-200 bg-white p-5 font-body text-sm">
          <p>No market categories yet. Partners need at least one before they can add products.</p>
          <button type="button" onClick={() => create({ suggested: true })} className="bg-brand-black px-4 py-2 text-xs uppercase tracking-wider text-white">
            Add suggested categories
          </button>
          <p className="text-xs text-gray-400">Fashion, Accessories, Art &amp; Prints, Beauty, Food &amp; Drinks, Home, Other</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 bg-white font-body text-sm">
          {cats.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span>
                {c.name} <span className="text-xs text-gray-400">· {c._count.products} products</span>
              </span>
              <span className="flex gap-3 text-xs uppercase tracking-wider">
                <button type="button" onClick={() => rename(c)} className="text-gray-600 underline">Rename</button>
                <button type="button" onClick={() => remove(c)} className="text-brand-red underline">Delete</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
