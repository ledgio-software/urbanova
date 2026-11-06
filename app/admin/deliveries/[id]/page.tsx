import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { mapsUrl, MAX_CODE_ATTEMPTS, STATUS_LABELS } from '@/lib/delivery'
import { DeliveryStatusBadge } from '@/components/admin/DeliveryStatusBadge'
import { DeliveryActions } from '@/components/admin/DeliveryActions'

export const dynamic = 'force-dynamic'

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [job, riders] = await Promise.all([
    prisma.deliveryJob.findUnique({
      where: { id },
      include: { rider: true, events: { orderBy: { createdAt: 'asc' } }, order: { select: { id: true } } },
    }),
    prisma.rider.findMany({ where: { status: 'active' }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])
  if (!job) notFound()

  const stop = (title: string, name: string, phone: string, address: string) => (
    <div className="border border-gray-200 bg-white p-5 font-body text-sm">
      <p className="text-xs uppercase tracking-widest text-gray-500">{title}</p>
      <p className="mt-2 font-semibold text-brand-black">{name}</p>
      <p className="text-gray-600">{address}</p>
      <div className="mt-2 flex gap-3 text-xs">
        {phone && <a href={`tel:${phone}`} className="text-brand-red underline">{phone}</a>}
        <a href={mapsUrl(address)} target="_blank" rel="noopener noreferrer" className="text-gray-500 underline">Map</a>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <Link href="/admin/deliveries" className="text-xs font-body uppercase tracking-wider text-gray-500 hover:text-brand-black">← Deliveries</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold text-brand-black">{job.trackingCode}</h1>
          <DeliveryStatusBadge status={job.status} />
        </div>
        <p className="mt-1 text-xs font-body text-gray-500">
          {job.source === 'store_order' && job.order ? (
            <Link href={`/admin/orders/${job.order.id}`} className="underline">Website order #{job.order.id.slice(-8).toUpperCase()}</Link>
          ) : job.source === 'booking' ? 'Booking' : 'Partner order'}
          {' · '}Fee {formatPrice(job.fee)}
          {' · '}<a href={`/track/${job.trackingCode}`} target="_blank" className="underline">Customer tracking page ↗</a>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-gray-200 bg-white p-5 font-body text-sm">
          <p className="text-xs uppercase tracking-widest text-gray-500">Delivery code</p>
          <p className="mt-2 font-mono text-3xl tracking-[0.3em] text-brand-black" data-testid="delivery-code">{job.deliveryCode}</p>
          <p className="mt-1 text-xs text-gray-400">
            The customer gives this to the rider. Wrong tries: {job.codeAttempts}/{MAX_CODE_ATTEMPTS}
          </p>
        </div>
        {stop('Pickup', job.pickupName, job.pickupPhone, job.pickupAddress)}
        {stop('Drop-off', job.dropoffName, job.dropoffPhone, job.dropoffAddress)}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="border border-gray-200 bg-white p-5 font-body text-sm">
          <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Rider</h2>
          {job.rider ? (
            <div className="mt-2">
              <p className="font-semibold">{job.rider.name}</p>
              <a href={`tel:${job.rider.phone}`} className="text-brand-red underline">{job.rider.phone}</a>
              {job.rider.vehicle && <p className="text-gray-500">{job.rider.vehicle}</p>}
            </div>
          ) : (
            <p className="mt-2 text-amber-700">Not assigned yet</p>
          )}
          {job.notes && <p className="mt-3 border-t border-gray-100 pt-3 text-gray-600"><span className="text-xs uppercase tracking-widest text-gray-400">Notes</span><br />{job.notes}</p>}
          {job.failureReason && <p className="mt-3 text-brand-red">Failed: {job.failureReason}</p>}
        </section>

        <section className="border border-gray-200 bg-white p-5 font-body text-sm">
          <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Timeline</h2>
          <ol className="mt-3 space-y-2">
            {job.events.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="w-32 shrink-0 text-xs text-gray-400">{e.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</span>
                <span>
                  <span className="font-semibold">{STATUS_LABELS[e.status]}</span>
                  <span className="text-gray-400"> · {e.actor}</span>
                  {e.note && <span className="block text-gray-600">{e.note}</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <DeliveryActions jobId={job.id} status={job.status} currentRiderId={job.riderId} riders={riders} />
    </div>
  )
}
