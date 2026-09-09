import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const [totalOrders, paidOrders, pendingOrders, totalProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: { in: ['paid', 'packed', 'shipped', 'delivered'] } },
        select: { total: true },
      }),
      prisma.order.count({ where: { status: 'pending_payment' } }),
      prisma.product.count(),
    ])
    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0)
    return { totalOrders, revenue, pendingOrders, totalProducts }
  } catch {
    return { totalOrders: 0, revenue: 0, pendingOrders: 0, totalProducts: 0 }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const tiles = [
    { label: 'Total Orders', value: stats.totalOrders.toString() },
    { label: 'Revenue (paid)', value: formatPrice(stats.revenue) },
    { label: 'Pending Payment', value: stats.pendingOrders.toString() },
    { label: 'Products', value: stats.totalProducts.toString() },
  ]

  return (
    <div>
      <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <p className="text-xs font-body uppercase tracking-widest text-gray-400 mb-2">{t.label}</p>
            <p className="text-2xl font-headline text-brand-black">{t.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
