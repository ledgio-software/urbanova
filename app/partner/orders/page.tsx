import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { requirePartnerPage } from '@/lib/dashboard-page'
import { STATUS_LABEL } from '@/lib/stockist-orders'

export const dynamic = 'force-dynamic'

// Orders paid directly to a stockist (Reference I.6). Newest first; open ones on top.
export default async function StockistOrdersPage() {
  const { partner } = await requirePartnerPage()
  if (partner.type !== 'stockist') redirect('/partner')

  const orders = await prisma.order.findMany({
    where: { sellerPartnerId: partner.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { customer: { select: { name: true } }, _count: { select: { items: true } } },
  })
  const open = orders.filter((o) => !['delivered', 'cancelled', 'returned'].includes(o.status))
  const done = orders.filter((o) => ['delivered', 'cancelled', 'returned'].includes(o.status))

  const list = (rows: typeof orders) => (
    <ul className="divide-y divide-gray-100 border border-gray-200 bg-white font-body text-sm">
      {rows.map((o) => (
        <li key={o.id}>
          <Link href={`/partner/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 hover:bg-gray-50">
            <span className="font-mono font-semibold text-brand-black">#{o.id.slice(-8).toUpperCase()}</span>
            <span className="flex-1 text-gray-700">{o.customer?.name ?? 'Customer'} · {o._count.items} item{o._count.items === 1 ? '' : 's'}</span>
            <span className="text-gray-500">{o.createdAt.toISOString().slice(0, 10)}</span>
            <span className="font-semibold text-brand-black">{formatPrice(o.total)}</span>
            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${o.status === 'pending_payment' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
              {STATUS_LABEL[o.status]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Orders</h1>
        <p className="mt-1 text-sm font-body text-gray-500">
          Customers pay you directly to your Mobile Money account. Check you&apos;ve received the money, then confirm it here and deliver the order.
        </p>
      </div>
      {orders.length === 0 ? (
        <p className="font-body text-sm text-gray-500">No orders yet.</p>
      ) : (
        <>
          <section className="space-y-3" data-testid="open-orders">
            <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">To do ({open.length})</h2>
            {open.length ? list(open) : <p className="font-body text-sm text-gray-500">Nothing to do right now.</p>}
          </section>
          {done.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Finished</h2>
              {list(done)}
            </section>
          )}
        </>
      )}
    </div>
  )
}
