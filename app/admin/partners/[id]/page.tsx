import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { bpsToPercent } from '@/lib/partners'
import { PartnerForm, type PartnerFormValues } from '@/components/admin/PartnerForm'
import { PartnerLogins } from '@/components/admin/PartnerLogins'
import { PartnerStatusBadge } from '@/components/admin/PartnerStatusBadge'

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
    },
  })
  if (!partner) notFound()

  const percent = bpsToPercent(partner.commissionBps)
  const initial: PartnerFormValues = {
    name: partner.name,
    slug: partner.slug,
    status: partner.status,
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
      </div>
      <PartnerForm mode="edit" partnerId={partner.id} initial={initial} />
      <PartnerLogins
        partnerId={partner.id}
        phone={partner.contactPhone}
        users={partner.users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))}
      />
    </div>
  )
}
