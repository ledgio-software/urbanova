import Link from 'next/link'
import type { DeliveryStatus } from '@prisma/client'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { DeliveryStatusBadge } from '@/components/admin/DeliveryStatusBadge'

export const dynamic = 'force-dynamic'

const TABS: { key: string; label: string; statuses: DeliveryStatus[] | null }[] = [
  { key: 'open', label: 'Open', statuses: ['pending', 'assigned', 'picked_up', 'on_the_way', 'failed'] },
  { key: 'delivered', label: 'Delivered', statuses: ['delivered'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
  { key: 'all', label: 'All', statuses: null },
]

async function getJobs(statuses: DeliveryStatus[] | null) {
  try {
    return await prisma.deliveryJob.findMany({
      where: statuses ? { status: { in: statuses } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { rider: { select: { name: true } } },
    })
  } catch (err) {
    console.error('Failed to fetch deliveries:', err)
    return []
  }
}

export default async function DeliveriesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = 'open' } = await searchParams
  const current = TABS.find((t) => t.key === tab) ?? TABS[0]
  const jobs = await getJobs(current.statuses)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Deliveries</h1>
          <p className="mt-1 text-xs font-body text-gray-500">
            URBANOVA Delivery jobs. Website orders are sent from the order page; use “New booking” for parcels businesses book by phone or WhatsApp.
          </p>
        </div>
        <Link
          href="/admin/deliveries/new"
          className="self-start bg-brand-red px-4 py-2 text-xs font-body font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-brand-red/90 sm:self-auto"
        >
          + New booking
        </Link>
      </div>

      <nav className="flex gap-2 font-body text-xs uppercase tracking-wider">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/deliveries?tab=${t.key}`}
            className={`px-3 py-1.5 ${t.key === current.key ? 'bg-brand-black text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {jobs.length === 0 ? (
        <p className="font-body text-sm text-gray-500">No deliveries here.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 bg-white">
          <table className="w-full text-left font-body text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/deliveries/${j.id}`} className="font-mono font-semibold text-brand-black hover:text-brand-red">
                      {j.trackingCode}
                    </Link>
                    <p className="text-xs text-gray-400">{j.createdAt.toISOString().slice(0, 10)}</p>
                  </td>
                  <td className="px-4 py-3"><DeliveryStatusBadge status={j.status} /></td>
                  <td className="px-4 py-3">
                    <p className="text-brand-black">{j.dropoffName}</p>
                    <p className="max-w-xs truncate text-xs text-gray-500">{j.dropoffAddress}</p>
                  </td>
                  <td className="px-4 py-3">{j.rider?.name ?? <span className="text-amber-700">Unassigned</span>}</td>
                  <td className="px-4 py-3">{formatPrice(j.fee)}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">{j.source === 'store_order' ? 'Website order' : j.source === 'booking' ? 'Booking' : 'Partner order'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
