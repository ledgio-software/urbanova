import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  try {
    const [totalOrders, paidOrders, pendingOrders, totalProducts, recentOrders, lowStockVariants] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: { in: ['paid', 'packed', 'shipped', 'delivered'] } },
        select: { total: true },
      }),
      prisma.order.count({ where: { status: 'pending_payment' } }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, email: true } } },
      }),
      prisma.productVariant.findMany({
        where: { stockQuantity: { lte: 3 } },
        take: 5,
        include: { product: { select: { id: true, name: true } } },
        orderBy: { stockQuantity: 'asc' },
      }),
    ])

    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0)
    return {
      totalOrders,
      revenue,
      pendingOrders,
      totalProducts,
      recentOrders,
      lowStockVariants,
    }
  } catch {
    return {
      totalOrders: 0,
      revenue: 0,
      pendingOrders: 0,
      totalProducts: 0,
      recentOrders: [],
      lowStockVariants: [],
    }
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const tiles = [
    {
      label: 'Total Revenue (Paid)',
      value: formatPrice(data.revenue),
      subtext: 'Confirmed payments',
      color: 'border-l-4 border-green-500',
    },
    {
      label: 'Total Orders',
      value: data.totalOrders.toString(),
      subtext: 'Lifetime orders',
      color: 'border-l-4 border-blue-500',
    },
    {
      label: 'Pending Payment',
      value: data.pendingOrders.toString(),
      subtext: 'Awaiting MoMo / Paystack',
      color: 'border-l-4 border-yellow-500',
    },
    {
      label: 'Catalog Products',
      value: data.totalProducts.toString(),
      subtext: 'Active SKUs',
      color: 'border-l-4 border-brand-black',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">
            Dashboard Overview
          </h1>
          <p className="text-xs font-body text-gray-500 mt-1">
            Real-time catalog performance and recent sales activity
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products/new"
            className="bg-brand-red text-white text-xs font-body uppercase tracking-wider px-3.5 py-2 font-semibold hover:bg-brand-red/90 transition-colors shadow-sm"
          >
            + New Product
          </Link>
          <Link
            href="/admin/orders"
            className="bg-brand-black text-white text-xs font-body uppercase tracking-wider px-3.5 py-2 font-semibold hover:bg-brand-black/80 transition-colors"
          >
            View Orders
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-300 text-gray-700 bg-white text-xs font-body uppercase tracking-wider px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            Storefront ↗
          </a>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`bg-white rounded-lg p-5 shadow-sm border border-gray-100 ${t.color}`}
          >
            <p className="text-xs font-body uppercase tracking-widest text-gray-400 mb-1">
              {t.label}
            </p>
            <p className="text-2xl font-headline text-brand-black font-bold">{t.value}</p>
            <p className="text-[11px] font-body text-gray-400 mt-1">{t.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders Table (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg uppercase tracking-wider text-brand-black">
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs font-body text-brand-red hover:underline font-semibold uppercase tracking-wider">
              View All Orders →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Order ID</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Customer</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      No orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-brand-black">
                        <Link href={`/admin/orders/${o.id}`} className="hover:underline font-mono">
                          #{o.id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {o.customer?.name ?? 'Guest'}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatPrice(o.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 col on desktop) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg uppercase tracking-wider text-brand-black">
              Low Stock Urgency
            </h2>
            <span className="text-xs font-body text-gray-400">≤ 3 items left</span>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-3">
            {data.lowStockVariants.length === 0 ? (
              <p className="text-xs font-body text-gray-400 py-4 text-center">
                All SKUs are sufficiently stocked! ✓
              </p>
            ) : (
              data.lowStockVariants.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded border border-red-100 text-xs font-body">
                  <div>
                    <p className="font-semibold text-brand-black">{v.product.name}</p>
                    <p className="text-[11px] text-gray-500">Size: {v.size} · Color: {v.color}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded">
                      {v.stockQuantity} left
                    </span>
                    <Link
                      href={`/admin/products/${v.product.id}`}
                      className="block text-[10px] text-brand-black hover:underline mt-1 uppercase tracking-wider"
                    >
                      Restock →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
