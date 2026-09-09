import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'

export const dynamic = 'force-dynamic'

const STATUSES = [
  { value: '', label: 'All Orders' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
]

async function getOrders(status?: string, q?: string) {
  try {
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (q && q.trim()) {
      const query = q.trim()
      where.OR = [
        { id: { contains: query, mode: 'insensitive' } },
        { deliveryAddress: { contains: query, mode: 'insensitive' } },
        { paymentReference: { contains: query, mode: 'insensitive' } },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
        { customer: { email: { contains: query, mode: 'insensitive' } } },
        { customer: { phone: { contains: query, mode: 'insensitive' } } },
      ]
    }

    return await prisma.order.findMany({
      where,
      include: { customer: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  } catch (err) {
    console.error('Failed to load orders:', err)
    return []
  }
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const orders = await getOrders(status, q)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Orders</h1>
          <p className="text-xs font-body text-gray-500 mt-1">
            Showing {orders.length} order{orders.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Order Search Form */}
        <form method="GET" className="flex items-center gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search Name, Phone, Email, ID..."
            className="border border-gray-200 px-3 py-2 text-xs font-body focus:outline-none focus:border-brand-black w-64 bg-white"
          />
          <button
            type="submit"
            className="bg-brand-black text-white text-xs font-body uppercase tracking-wider px-3.5 py-2 hover:bg-brand-black/80 transition-colors"
          >
            Search
          </button>
          {q && (
            <Link
              href={status ? `/admin/orders?status=${status}` : '/admin/orders'}
              className="text-xs font-body text-gray-500 hover:text-brand-red px-2"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => {
          const params = new URLSearchParams()
          if (s.value) params.set('status', s.value)
          if (q) params.set('q', q)
          const href = `/admin/orders${params.toString() ? `?${params.toString()}` : ''}`
          const active = (status ?? '') === s.value

          return (
            <Link
              key={s.value}
              href={href}
              className={`px-3 py-1.5 text-xs font-body uppercase tracking-widest rounded border transition-colors ${
                active
                  ? 'bg-brand-black text-white border-brand-black font-semibold'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
              }`}
            >
              {s.label}
            </Link>
          )
        })}
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Order ID</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Customer</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Payment</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Total</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No orders match the selected criteria.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-brand-black hover:underline">
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <p className="font-medium text-brand-black">{order.customer?.name ?? 'Guest'}</p>
                  <p className="text-xs text-gray-400">{order.customer?.phone ?? order.customer?.email ?? '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 capitalize">
                  {order.paymentMethod.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-brand-black">
                  {formatPrice(order.total)}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-block px-2.5 py-1 text-xs font-body font-semibold uppercase tracking-wider text-brand-black bg-gray-100 hover:bg-brand-black hover:text-white rounded transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
