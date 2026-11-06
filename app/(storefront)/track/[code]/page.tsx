import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { firstName, STATUS_LABELS, TRACKING_STEPS } from '@/lib/delivery'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Track delivery',
  robots: { index: false, follow: false },
}

// Public tracking page. Shows progress only — no addresses, phone numbers or the delivery code.
export default async function TrackDeliveryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  if (!/^UD-[A-Z0-9]{8}$/.test(code)) notFound()

  const job = await prisma.deliveryJob.findUnique({
    where: { trackingCode: code },
    select: {
      trackingCode: true,
      status: true,
      dropoffName: true,
      rider: { select: { name: true } },
      events: { select: { status: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!job) notFound()

  const reachedAt = new Map(job.events.map((e) => [e.status, e.createdAt]))
  const currentIndex = TRACKING_STEPS.indexOf(job.status)
  const stopped = job.status === 'failed' || job.status === 'cancelled'
  const time = (d: Date | undefined) =>
    d ? d.toLocaleString('en-GH', { timeZone: 'Africa/Accra', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-red">URBANOVA Delivery</p>
      <h1 className="mt-2 font-headline text-display-md uppercase tracking-widest text-brand-black">{STATUS_LABELS[job.status]}</h1>
      <p className="mt-2 font-body text-sm text-brand-black/60">
        Tracking <span className="font-mono">{job.trackingCode}</span> · for {firstName(job.dropoffName)}
        {job.rider && !stopped && job.status !== 'delivered' && <> · your rider is {firstName(job.rider.name)}</>}
      </p>

      {stopped ? (
        <p className="mt-8 border border-brand-black/10 bg-white p-5 font-body text-sm text-brand-black/70">
          {job.status === 'failed'
            ? 'We couldn’t complete this delivery. URBANOVA will contact you to arrange another attempt.'
            : 'This delivery was cancelled. Contact URBANOVA if you have questions.'}
        </p>
      ) : (
        <ol className="mt-10 space-y-0 border-l-2 border-brand-black/10" data-testid="tracking-steps">
          {TRACKING_STEPS.map((step, i) => {
            const done = i <= currentIndex
            return (
              <li key={step} className="relative pb-8 pl-8 last:pb-0" data-done={done}>
                <span
                  className={`absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2 ${
                    done ? 'border-brand-red bg-brand-red' : 'border-brand-black/20 bg-brand-white'
                  }`}
                />
                <p className={`font-headline text-lg uppercase tracking-widest ${done ? 'text-brand-black' : 'text-brand-black/30'}`}>{STATUS_LABELS[step]}</p>
                {done && <p className="font-body text-xs text-brand-black/50">{time(reachedAt.get(step))}</p>}
              </li>
            )
          })}
        </ol>
      )}

      {!stopped && job.status !== 'delivered' && (
        <p className="mt-10 font-body text-sm text-brand-black/60">
          When your rider arrives, give them the 4-digit delivery code from your order confirmation.
        </p>
      )}
    </div>
  )
}
