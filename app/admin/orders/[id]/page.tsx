'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data: OrderDetail) => {
        setOrder(data)
        setStatus(data.status)
      })
      .catch((err) => setError('Failed to load order details.'))
  }, [id])

  async function handleStatusChange(newStatus: string) {
    if (newStatus === 'cancelled' || newStatus === 'returned') {
      if (!confirm(`Are you sure you want to change status to "${newStatus.toUpperCase()}"?`)) {
        return
      }
    }
    setStatus(newStatus)
  }

  async function saveStatus() {
    if (!order || status === order.status) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Status update failed')
      setSaving(false)
      setSaved(true)
      setOrder((o) => (o ? { ...o, status } : o))
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaving(false)
      setError('Could not update status. Please try again.')
    }
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded border border-red-200 text-sm font-body">
        {error}
        <button onClick={() => router.back()} className="block mt-3 text-xs underline font-semibold">
          ← Back to Orders
        </button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-4 max-w-3xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-28 bg-gray-200 rounded"></div>
          <div className="h-28 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Format phone number for WhatsApp wa.me link
  let whatsappUrl = ''
  if (order.customer?.phone) {
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? `233${cleanPhone.slice(1)}` : cleanPhone
    const text = encodeURIComponent(
      `Hi ${order.customer.name}, this is URBANOVA Support regarding your order #${order.id.slice(-8).toUpperCase()} (Status: ${order.status.replace(/_/g, ' ')}).`
    )
    whatsappUrl = `https://wa.me/${formattedPhone}?text=${text}`
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="text-gray-400 hover:text-brand-black text-sm font-body font-semibold">
            ← Orders
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-body uppercase tracking-wider font-semibold px-4 py-2.5 rounded hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <span>WhatsApp Customer</span>
            <span>💬</span>
          </a>
        )}
      </div>

      {/* Grid of Details */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Customer Box */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 space-y-2">
          <h2 className="text-xs font-body uppercase tracking-widest text-gray-400">Customer Details</h2>
          {order.customer ? (
            <div className="text-sm font-body space-y-1 pt-1">
              <p className="font-semibold text-brand-black text-base">{order.customer.name}</p>
              <p className="text-gray-600 flex items-center gap-1">
                <span>📧</span> {order.customer.email}
              </p>
              <p className="text-gray-600 flex items-center gap-1 font-mono">
                <span>📞</span> {order.customer.phone}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 pt-1">Guest Checkout (No Customer Profile)</p>
          )}
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 space-y-2">
          <h2 className="text-xs font-body uppercase tracking-widest text-gray-400">Delivery Address & Zone</h2>
          <div className="text-sm font-body space-y-1 pt-1">
            <p className="font-semibold text-brand-black">{order.deliveryZone}</p>
            <p className="text-gray-600 leading-relaxed">{order.deliveryAddress}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 space-y-2">
          <h2 className="text-xs font-body uppercase tracking-widest text-gray-400">Payment Information</h2>
          <div className="text-sm font-body space-y-1.5 pt-1">
            <p className="text-brand-black font-medium capitalize">
              Method: <span className="font-semibold">{order.paymentMethod.replace(/_/g, ' ')}</span>
            </p>
            {order.paymentReference ? (
              <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded border border-gray-100 select-all">
                Ref: {order.paymentReference}
              </p>
            ) : (
              <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                Direct MoMo transfer / Pending confirmation
              </p>
            )}
          </div>
        </div>

        {/* Update Status Box */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 space-y-2">
          <h2 className="text-xs font-body uppercase tracking-widest text-gray-400">Fulfillment Status</h2>
          <div className="space-y-3 pt-1">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-brand-black rounded"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
            <button
              onClick={saveStatus}
              disabled={saving || status === order.status}
              className="w-full py-2.5 bg-brand-black text-white text-xs font-body uppercase tracking-widest font-semibold hover:bg-brand-black/80 disabled:opacity-40 transition-colors rounded"
            >
              {saving ? 'Updating…' : saved ? 'Status Saved ✓' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Items Purchased */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <h2 className="px-5 py-3.5 text-xs font-body uppercase tracking-widest text-gray-500 bg-gray-50 border-b border-gray-100">
          Order Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
        </h2>
        <table className="w-full text-sm font-body">
          <tbody className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-brand-black">{item.variant.product.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    Size: {item.variant.size} · Color: {item.variant.color} · SKU: {item.variant.sku}
                  </p>
                </td>
                <td className="px-5 py-3.5 text-center text-gray-600 font-medium">×{item.quantity}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-brand-black">
                  {formatPrice(item.unitPrice * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Breakdown */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 ml-auto max-w-xs space-y-2 text-sm font-body">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Delivery Fee</span><span>{formatPrice(order.deliveryFee)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100 text-brand-black">
          <span>Total Paid</span><span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  )
}
