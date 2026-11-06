import Link from 'next/link'
import { requirePartnerPage } from '@/lib/partner-page'
import { formatCommission, PAYOUT_METHODS } from '@/lib/partners'

export const dynamic = 'force-dynamic'

const STATUS_COPY = {
  pending: {
    title: 'Not live yet',
    body: 'Finish setting up your page below. URBANOVA will switch your page on once it is ready.',
    tone: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  active: {
    title: 'Live',
    body: 'Your partner account is active.',
    tone: 'border-green-300 bg-green-50 text-green-900',
  },
  suspended: {
    title: 'Suspended',
    body: 'Contact URBANOVA.',
    tone: 'border-gray-300 bg-gray-100 text-gray-800',
  },
} as const

export default async function PartnerDashboardPage() {
  const { user, partner } = await requirePartnerPage()
  const status = STATUS_COPY[partner.status]

  const checklist = [
    { done: Boolean(partner.logoUrl), label: 'Add your logo' },
    { done: Boolean(partner.bannerUrl), label: 'Add a banner image' },
    { done: Boolean(partner.tagline && partner.description), label: 'Write your tagline and “About” text' },
    { done: Boolean(partner.payoutMethod && partner.payoutAccountNumber), label: 'Add where to send your payouts' },
  ]
  const payoutLabel = PAYOUT_METHODS.find((m) => m.value === partner.payoutMethod)?.label

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">{partner.name}</h1>
        <p className="mt-1 text-sm font-body text-gray-500">Welcome back, {user.name}.</p>
      </div>

      <div className={`border p-4 font-body text-sm ${status.tone}`}>
        <p className="font-semibold uppercase tracking-wider">{status.title}</p>
        <p className="mt-1">{status.body}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="border border-gray-200 bg-white p-5">
          <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Set up your page</h2>
          <ul className="mt-3 space-y-2 font-body text-sm">
            {checklist.map((item) => (
              <li key={item.label} className={item.done ? 'text-gray-400 line-through' : 'text-gray-800'}>
                <span aria-hidden className="mr-2">{item.done ? '✓' : '○'}</span>
                {item.label}
              </li>
            ))}
          </ul>
          <Link href="/partner/profile" className="mt-4 inline-block bg-brand-black px-4 py-2 text-xs font-body uppercase tracking-wider text-white">
            Edit my page
          </Link>
        </section>

        <section className="border border-gray-200 bg-white p-5 font-body text-sm">
          <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Your terms</h2>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">URBANOVA commission</dt>
              <dd className="font-semibold">{formatCommission(partner.commissionBps)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Payouts to</dt>
              <dd className="text-right">{payoutLabel ? `${payoutLabel} · ${partner.payoutAccountNumber ?? ''}` : 'Not set'}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-gray-400">
            Product listings, orders and earnings are coming to this dashboard next.
          </p>
        </section>
      </div>
    </div>
  )
}
