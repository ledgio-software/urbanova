import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requirePartnerPage } from '@/lib/dashboard-page'
import { formatCommission, PAYOUT_METHODS } from '@/lib/partners'
import { partnerSiteUrls } from '@/lib/partner-hosts'

export const dynamic = 'force-dynamic'

const STATUS_COPY = {
  pending: {
    title: 'Not live yet',
    body: 'Finish setting up your page below. URBANOVA will switch your page on once it is ready.',
    tone: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  active: {
    title: 'Live',
    body: 'Your page and products are live on Nova Market.',
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
  const stockist = partner.type === 'stockist'
  const status =
    stockist && partner.status === 'active'
      ? { ...STATUS_COPY.active, body: 'Your shop page is live. Customers pay you directly for their orders.' }
      : STATUS_COPY[partner.status]
  const [productCount, officialCount, openOrders] = await Promise.all([
    prisma.product.count({ where: { partnerId: partner.id } }),
    prisma.product.count({ where: { partnerId: partner.id, sourceProductId: { not: null } } }),
    stockist ? prisma.order.count({ where: { sellerPartnerId: partner.id, status: { in: ['pending_payment', 'paid', 'packed', 'shipped'] } } }) : 0,
  ])

  const checklist = [
    { done: Boolean(partner.logoUrl), label: 'Add your logo' },
    { done: Boolean(partner.bannerUrl), label: 'Add a banner image' },
    { done: Boolean(partner.tagline && partner.description), label: 'Write your tagline and “About” text' },
    stockist
      ? { done: Boolean(partner.payoutMethod && partner.payoutAccountName && partner.payoutAccountNumber), label: 'Add the Mobile Money account customers pay into' }
      : { done: Boolean(partner.payoutMethod && partner.payoutAccountNumber), label: 'Add where to send your payouts' },
    ...(stockist ? [{ done: officialCount > 0, label: 'Add the URBANOVA items you stock' }] : []),
    { done: productCount > officialCount, label: stockist ? 'Add your own products (optional)' : 'Add your first product' },
  ]
  const sites = partnerSiteUrls(partner)
  const payoutLabel = PAYOUT_METHODS.find((m) => m.value === partner.payoutMethod)?.label

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">{partner.name}</h1>
        <p className="mt-1 text-sm font-body text-gray-500">Welcome back, {user.name}.</p>
      </div>

      <div className={`border p-4 font-body text-sm ${status.tone}`}>
        <p className="font-semibold uppercase tracking-wider">{status.title}{stockist ? ' · URBANOVA Stockist' : ''}</p>
        <p className="mt-1">{status.body}</p>
      </div>

      {stockist && openOrders > 0 && (
        <Link href="/partner/orders" className="block border border-brand-red bg-white p-4 font-body text-sm text-brand-black hover:bg-red-50" data-testid="open-orders-alert">
          <strong>{openOrders}</strong> order{openOrders === 1 ? '' : 's'} to handle → Orders
        </Link>
      )}

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
              <dd className="font-semibold">{stockist ? 'None' : formatCommission(partner.commissionBps)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">{stockist ? 'Customers pay' : 'Payouts to'}</dt>
              <dd className="text-right">{payoutLabel ? `${payoutLabel} · ${partner.payoutAccountNumber ?? ''}` : 'Not set'}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/partner/products" className="bg-brand-black px-4 py-2 text-xs uppercase tracking-wider text-white">Products</Link>
            {partner.status === 'active' && (
              <a href={sites.primary ?? `/partners/${partner.slug}`} target="_blank" rel="noopener noreferrer" className="border border-gray-300 px-4 py-2 text-xs uppercase tracking-wider text-gray-700">View my website</a>
            )}
          </div>
          {partner.status === 'active' && (sites.custom || sites.subdomain) && (
            <div className="mt-4 space-y-1 text-xs" data-testid="my-websites">
              <p className="uppercase tracking-widest text-gray-500">Your website</p>
              {[sites.custom, sites.subdomain].filter(Boolean).map((u) => (
                <p key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="font-mono text-brand-red underline">{u!.replace('https://', '')}</a></p>
              ))}
              <p className="text-gray-500">Share this link on WhatsApp, Instagram and TikTok. Want your own .com? Buy one and ask URBANOVA to connect it.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
