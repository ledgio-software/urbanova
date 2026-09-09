'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/format'

type Zone = { id: string; name: string; estimatedDays: string; fee: number }

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', estimatedDays: '', fee: '' })
  const [newForm, setNewForm] = useState({ name: '', estimatedDays: '', fee: '' })
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/admin/delivery-zones')
      const data = await res.json()
      setZones(data)
    } finally {
      setLoading(false)
    }
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
    if (!confirm('Delete this delivery zone? Orders using this zone will remain intact.')) return
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
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Delivery Zones</h1>
          <p className="text-xs font-body text-gray-500 mt-1">
            Configure regional delivery fees and estimated fulfillment timelines
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="bg-brand-red text-white text-xs font-body uppercase tracking-wider font-semibold px-4 py-2 hover:bg-brand-red/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          + Add Zone
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {zones.length === 0 && !adding && (
            <div className="bg-white p-8 rounded-lg border border-gray-100 text-center text-gray-400 text-sm font-body">
              No delivery zones configured yet. Click "+ Add Zone" to create one.
            </div>
          )}

          {zones.map((zone) =>
            editing === zone.id ? (
              <div key={zone.id} className="bg-white rounded-lg p-5 shadow-sm border border-brand-black space-y-4">
                <h3 className="text-xs font-body uppercase tracking-widest text-brand-black font-semibold">Editing Zone</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-body text-gray-400 block mb-1">Zone Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Accra Central"
                      className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-body text-gray-400 block mb-1">Estimated Days</label>
                    <input
                      value={editForm.estimatedDays}
                      onChange={(e) => setEditForm((p) => ({ ...p, estimatedDays: e.target.value }))}
                      placeholder="e.g. 1–2 business days"
                      className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-body text-gray-400 block mb-1">Fee (GHS)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.fee}
                      onChange={(e) => setEditForm((p) => ({ ...p, fee: e.target.value }))}
                      placeholder="e.g. 25.00"
                      className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => saveEdit(zone.id)}
                    disabled={saving}
                    className="px-4 py-2 bg-brand-black text-white text-xs font-body uppercase tracking-wider font-semibold disabled:opacity-50 hover:bg-brand-black/80 transition-colors rounded"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 text-xs font-body text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={zone.id} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-brand-black font-body text-base">{zone.name}</p>
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-body uppercase px-2 py-0.5 rounded font-semibold">
                      {zone.estimatedDays}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-body">Delivery Fee: <strong className="text-brand-black">{formatPrice(zone.fee)}</strong></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(zone)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-brand-black hover:text-white text-xs font-body font-semibold uppercase tracking-wider text-brand-black rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteZone(zone.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-xs font-body font-semibold uppercase tracking-wider text-red-600 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}

          {adding && (
            <form onSubmit={addZone} className="bg-white rounded-lg p-5 shadow-sm border border-brand-red/40 space-y-4">
              <h3 className="text-xs font-body uppercase tracking-widest text-brand-red font-semibold">New Delivery Zone</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-body text-gray-400 block mb-1">Zone Name</label>
                  <input
                    value={newForm.name}
                    onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="e.g. Accra Central"
                    className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-body text-gray-400 block mb-1">Estimated Days</label>
                  <input
                    value={newForm.estimatedDays}
                    onChange={(e) => setNewForm((p) => ({ ...p, estimatedDays: e.target.value }))}
                    required
                    placeholder="e.g. 1–2 business days"
                    className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-body text-gray-400 block mb-1">Fee (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newForm.fee}
                    onChange={(e) => setNewForm((p) => ({ ...p, fee: e.target.value }))}
                    required
                    placeholder="e.g. 25.00"
                    className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-red text-white text-xs font-body uppercase tracking-wider font-semibold disabled:opacity-50 hover:bg-brand-red/90 transition-colors rounded"
                >
                  {saving ? 'Adding…' : 'Add Zone'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="px-4 py-2 text-xs font-body text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
