import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { bpsToPercent } from '@/lib/partners'
import { PartnerForm, type PartnerFormValues } from '@/components/admin/PartnerForm'
import { PartnerLogins } from '@/components/admin/PartnerLogins'
import { PartnerStatusBadge } from '@/components/admin/PartnerStatusBadge'
import { AdminHideProductButton } from '@/components/admin/AdminHideProductButton'
import { formatPrice } from '@/lib/format'
import { partnerRootDomain, partnerSiteUrls } from '@/lib/partner-hosts'

export const dynamic = 'force-dynamic'

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true, name: true, email: true, mustChangePassword: true, lastLoginAt: true },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { products: true } },
      products: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          isActive: true,
          adminHidden: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
          variants: { select: { stockQuantity: true } },
        },
      },
    },
  })
  if (!partner) notFound()

  const percent = bpsToPercent(partner.commissionBps)
  const initial: PartnerFormValues = {
    name: partner.name,
    slug: partner.slug,
    status: partner.status,
    type: partner.type,
    customDomain: partner.customDomain ?? '',
    commissionPercent: percent === null ? '' : String(percent),
    tagline: partner.tagline ?? '',
    description: partner.description ?? '',
    logoUrl: partner.logoUrl,
    bannerUrl: partner.bannerUrl,
    contactEmail: partner.contactEmail,
    contactPhone: partner.contactPhone,
    location: partner.location ?? '',
    payoutMethod: partner.payoutMethod ?? '',
    payoutAccountName: partner.payoutAccountName ?? '',
    payoutAccountNumber: partner.payoutAccountNumber ?? '',
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <Link href="/admin/partners" className="text-xs font-body uppercase tracking-wider text-gray-500 hover:text-brand-black">
          ← Partners
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">{partner.name}</h1>
          <PartnerStatusBadge status={partner.status} />
        </div>
        <p className="mt-1 text-xs font-body text-gray-500">{partner._count.products} products</p>
        {partner.status === 'active' && (
          <p className="mt-1 flex flex-wrap gap-3 text-xs font-body" data-testid="partner-websites">
            {[partnerSiteUrls(partner).custom, partnerSiteUrls(partner).subdomain].filter(Boolean).map((u) => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">{u!.replace('https://', '')}</a>
            ))}
          </p>
        )}
      </div>
      <PartnerForm mode="edit" partnerId={partner.id} initial={initial} rootDomain={partnerRootDomain()} />
      <section id="products" className="max-w-3xl scroll-mt-6 border border-gray-200 bg-white p-5">
        <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black">Products</h2>
        <p className="mt-1 text-xs font-body text-gray-500">Added and edited by the partner. You can hide anything that breaks the seller rules.</p>
        {partner.products.length === 0 ? (
          <p className="mt-3 font-body text-sm text-gray-500">No products yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 font-body text-sm">
            {partner.products.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.images[0] && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-black">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatPrice(p.basePrice)} · {p.variants.reduce((n, v) => n + v.stockQuantity, 0)} in stock ·{' '}
                    {p.adminHidden ? 'Hidden by URBANOVA' : p.isActive ? 'Shown' : 'Hidden by partner'}
                  </p>
                </div>
                <a href={`/product/${p.slug}`} target="_blank" className="text-xs uppercase tracking-wider text-gray-500 underline">View</a>
                <AdminHideProductButton productId={p.id} adminHidden={p.adminHidden} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <PartnerLogins
        partnerId={partner.id}
        phone={partner.contactPhone}
        users={partner.users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))}
      />
    </div>
  )
}
