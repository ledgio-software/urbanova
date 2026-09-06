import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'

export const dynamic = 'force-dynamic'

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

async function getOrders(status?: string) {
  try {
    return await prisma.order.findMany({
      where: status ? { status: status as never } : {},
      include: { customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  } catch {
    return []
  }
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const orders = await getOrders(status)

  return (
    <div>
      <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black mb-6">Orders</h1>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value ? `/admin/orders?status=${s.value}` : '/admin/orders'}
            className={`px-3 py-1.5 text-xs font-body uppercase tracking-widest rounded border transition-colors ${
              (status ?? '') === s.value
                ? 'bg-brand-black text-white border-brand-black'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Order</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Customer</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Status</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Total</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No orders found.</td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-black hover:underline">
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {order.customer?.name ?? '—'}
                  <br />
                  <span className="text-xs text-gray-400">{order.customer?.email}</span>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
