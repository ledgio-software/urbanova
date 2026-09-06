'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/format'

type Zone = { id: string; name: string; estimatedDays: string; fee: number }

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', estimatedDays: '', fee: '' })
  const [newForm, setNewForm] = useState({ name: '', estimatedDays: '', fee: '' })
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/delivery-zones')
    const data = await res.json()
    setZones(data)
  }

  useEffect(() => { load() }, [])

  function startEdit(zone: Zone) {
    setEditing(zone.id)
    setEditForm({ name: zone.name, estimatedDays: zone.estimatedDays, fee: (zone.fee / 100).toFixed(2) })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    await fetch(`/api/admin/delivery-zones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editForm.name, estimatedDays: editForm.estimatedDays, fee: Math.round(parseFloat(editForm.fee) * 100) }),
    })
    setSaving(false)
    setEditing(null)
    load()
  }

  async function deleteZone(id: string) {
    if (!confirm('Delete this delivery zone?')) return
    await fetch(`/api/admin/delivery-zones/${id}`, { method: 'DELETE' })
    load()
  }

  async function addZone(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/admin/delivery-zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newForm.name, estimatedDays: newForm.estimatedDays, fee: Math.round(parseFloat(newForm.fee) * 100) }),
    })
    setSaving(false)
    setAdding(false)
    setNewForm({ name: '', estimatedDays: '', fee: '' })
    load()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Delivery Zones</h1>
        <button
          onClick={() => setAdding(true)}
          className="bg-brand-red text-white text-xs font-body uppercase tracking-widest px-4 py-2 hover:bg-brand-red/80 transition-colors"
        >
          + Add Zone
        </button>
      </div>

      <div className="space-y-3">
        {zones.map((zone) =>
          editing === zone.id ? (
            <div key={zone.id} className="bg-white rounded-lg p-4 shadow-sm border border-brand-black/20 space-y-3">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Zone name"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
              />
              <input
                value={editForm.estimatedDays}
                onChange={(e) => setEditForm((p) => ({ ...p, estimatedDays: e.target.value }))}
                placeholder="e.g. 1–2 business days"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
              />
              <input
                type="number"
                step="0.01"
                value={editForm.fee}
                onChange={(e) => setEditForm((p) => ({ ...p, fee: e.target.value }))}
                placeholder="Fee in GHS"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(zone.id)}
                  disabled={saving}
                  className="px-4 py-2 bg-brand-black text-white text-xs font-body uppercase tracking-widest disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs font-body text-gray-500 hover:text-gray-800">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={zone.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-black font-body">{zone.name}</p>
                <p className="text-sm text-gray-500 font-body">{zone.estimatedDays} · {formatPrice(zone.fee)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(zone)} className="text-xs font-body text-gray-500 hover:text-brand-black">Edit</button>
                <button onClick={() => deleteZone(zone.id)} className="text-xs font-body text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          )
        )}

        {adding && (
          <form onSubmit={addZone} className="bg-white rounded-lg p-4 shadow-sm border border-brand-red/30 space-y-3">
            <input
              value={newForm.name}
              onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
              required
              placeholder="Zone name (e.g. Accra Central)"
              className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
            />
            <input
              value={newForm.estimatedDays}
              onChange={(e) => setNewForm((p) => ({ ...p, estimatedDays: e.target.value }))}
              required
              placeholder="Estimated days (e.g. 1–2 business days)"
              className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
            />
            <input
              type="number"
              step="0.01"
              value={newForm.fee}
              onChange={(e) => setNewForm((p) => ({ ...p, fee: e.target.value }))}
              required
              placeholder="Delivery fee (GHS)"
              className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-red text-white text-xs font-body uppercase tracking-widest disabled:opacity-50">
                {saving ? 'Adding…' : 'Add Zone'}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 text-xs font-body text-gray-500 hover:text-gray-800">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
