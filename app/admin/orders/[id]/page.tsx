'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/format'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'

const ORDER_STATUSES = [
  'pending_payment', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'returned',
] as const

type OrderDetail = {
  id: string
  status: string
  subtotal: number
  deliveryFee: number
  total: number
  deliveryZone: string
  deliveryAddress: string
  paymentMethod: string
  paymentReference: string | null
  createdAt: string
  customer: { name: string; email: string; phone: string } | null
  items: {
    id: string
    quantity: number
    unitPrice: number
    variant: { sku: string; size: string; color: string; product: { name: string } }
  }[]
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data: OrderDetail) => {
        setOrder(data)
        setStatus(data.status)
      })
  }, [id])

  async function saveStatus() {
    if (!order || status === order.status) return
    setSaving(true)
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setSaving(false)
    setSaved(true)
    setOrder((o) => (o ? { ...o, status } : o))
    setTimeout(() => setSaved(false), 2000)
  }

  if (!order) return <div className="text-gray-400 font-body">Loading…</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700 text-sm font-body">← Back</button>
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* Customer */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <h2 className="text-xs font-body uppercase tracking-widest text-gray-400 mb-3">Customer</h2>
          {order.customer ? (
            <div className="text-sm font-body space-y-1">
              <p className="font-medium text-brand-black">{order.customer.name}</p>
              <p className="text-gray-500">{order.customer.email}</p>
              <p className="text-gray-500">{order.customer.phone}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No customer linked</p>
          )}
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <h2 className="text-xs font-body uppercase tracking-widest text-gray-400 mb-3">Delivery</h2>
          <div className="text-sm font-body space-y-1">
            <p className="text-gray-500">{order.deliveryZone}</p>
            <p className="text-gray-600">{order.deliveryAddress}</p>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <h2 className="text-xs font-body uppercase tracking-widest text-gray-400 mb-3">Payment</h2>
          <div className="text-sm font-body space-y-1">
            <p className="text-gray-600 capitalize">{order.paymentMethod.replace(/_/g, ' ')}</p>
            {order.paymentReference && (
              <p className="text-gray-400 text-xs font-mono">{order.paymentReference}</p>
            )}
          </div>
        </div>

        {/* Update Status */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <h2 className="text-xs font-body uppercase tracking-widest text-gray-400 mb-3">Update Status</h2>
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <button
              onClick={saveStatus}
              disabled={saving || status === order.status}
              className="px-4 py-2 bg-brand-black text-white text-xs font-body uppercase tracking-widest hover:bg-brand-black/80 disabled:opacity-40 transition-colors"
            >
              {saving ? '…' : saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
        <h2 className="px-5 py-4 text-xs font-body uppercase tracking-widest text-gray-400 border-b border-gray-100">Items</h2>
        <table className="w-full text-sm font-body">
          <tbody className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <p className="font-medium text-brand-black">{item.variant.product.name}</p>
                  <p className="text-xs text-gray-400">{item.variant.size} / {item.variant.color} · {item.variant.sku}</p>
                </td>
                <td className="px-5 py-3 text-center text-gray-600">×{item.quantity}</td>
                <td className="px-5 py-3 text-right font-medium">{formatPrice(item.unitPrice * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 ml-auto max-w-xs">
        <div className="space-y-2 text-sm font-body">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
