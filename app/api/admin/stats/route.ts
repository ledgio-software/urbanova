import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
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

  return NextResponse.json({ totalOrders, revenue, pendingOrders, totalProducts })
}
