import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { requirePartnerPage } from '@/lib/dashboard-page'
import { optionLabel } from '@/lib/market'
import { formatCommission } from '@/lib/partners'

export const dynamic = 'force-dynamic'

const PAID = ['paid', 'packed', 'shipped', 'delivered'] as const

// Read-only for now: URBANOVA coordinates delivery and pays partners manually (Reference I.1).
export default async function PartnerSalesPage() {
  const { partner } = await requirePartnerPage()
  const items = await prisma.orderItem.findMany({
    where: { variant: { product: { partnerId: partner.id } }, order: { status: { in: [...PAID] } } },
    orderBy: { order: { createdAt: 'desc' } },
    take: 200,
    include: {
      order: { select: { id: true, status: true, createdAt: true } },
      variant: { select: { size: true, color: true, product: { select: { name: true } } } },
    },
  })

  const gross = items.reduce((n, i) => n + i.unitPrice * i.quantity, 0)
  const commission = partner.commissionBps === null ? null : Math.round((gross * partner.commissionBps) / 10_000)

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Sales</h1>
        <p className="mt-1 text-sm font-body text-gray-500">
          Paid orders that include your products. URBANOVA will contact you about delivery and pays your share to your payout account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Sales', formatPrice(gross)],
          [`URBANOVA commission (${formatCommission(partner.commissionBps)})`, commission === null ? '—' : formatPrice(commission)],
          ['Your share', commission === null ? '—' : formatPrice(gross - commission)],
        ].map(([label, value]) => (
          <div key={label} className="border border-gray-200 bg-white p-5 font-body">
            <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-brand-black">{value}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="font-body text-sm text-gray-500">No sales yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 bg-white">
          <table className="w-full text-left font-body text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 text-gray-500">{i.order.createdAt.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-3 font-mono">#{i.order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">{i.variant.product.name} <span className="text-gray-400">· {optionLabel(i.variant)}</span></td>
                  <td className="px-4 py-3">{i.quantity}</td>
                  <td className="px-4 py-3">{formatPrice(i.unitPrice * i.quantity)}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wider">{i.order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
