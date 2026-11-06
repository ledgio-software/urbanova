import { prisma } from '@/lib/db'
import { requireRiderPage } from '@/lib/dashboard-page'
import { ACTIVE_STATUSES, mapsUrl, STATUS_LABELS } from '@/lib/delivery'
import { RiderJobCard } from '@/components/rider/RiderJobCard'

export const dynamic = 'force-dynamic'

export default async function RiderHomePage() {
  const { rider } = await requireRiderPage()
  const [active, recent] = await Promise.all([
    prisma.deliveryJob.findMany({
      where: { riderId: rider.id, status: { in: ACTIVE_STATUSES } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.deliveryJob.findMany({
      where: { riderId: rider.id, status: { in: ['delivered', 'failed'] } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { id: true, trackingCode: true, status: true, dropoffName: true, updatedAt: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">My deliveries</h1>
        <p className="text-sm font-body text-gray-500">{active.length === 0 ? 'Nothing assigned right now.' : `${active.length} to do`}</p>
      </div>

      <div className="space-y-4">
        {active.map((j) => (
          <RiderJobCard
            key={j.id}
            job={{
              id: j.id,
              trackingCode: j.trackingCode,
              status: j.status,
              statusLabel: STATUS_LABELS[j.status],
              pickupName: j.pickupName,
              pickupPhone: j.pickupPhone,
              pickupAddress: j.pickupAddress,
              dropoffName: j.dropoffName,
              dropoffPhone: j.dropoffPhone,
              dropoffAddress: j.dropoffAddress,
              notes: j.notes,
              pickupMapUrl: mapsUrl(j.pickupAddress),
              dropoffMapUrl: mapsUrl(j.dropoffAddress),
            }}
          />
        ))}
      </div>

      {recent.length > 0 && (
        <section>
          <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Recent</h2>
          <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 bg-white font-body text-sm">
            {recent.map((j) => (
              <li key={j.id} className="flex justify-between gap-3 px-4 py-3">
                <span>
                  <span className="font-mono">{j.trackingCode}</span> · {j.dropoffName}
                </span>
                <span className={j.status === 'delivered' ? 'text-green-700' : 'text-brand-red'}>{STATUS_LABELS[j.status]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
