import { requirePartnerPage } from '@/lib/dashboard-page'
import { PartnerProfileForm } from '@/components/partner/PartnerProfileForm'

export const dynamic = 'force-dynamic'

export default async function PartnerProfilePage() {
  const { partner } = await requirePartnerPage()

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">My Page</h1>
        <p className="mt-1 text-sm font-body text-gray-500">
          This is what customers will see on your page on the URBANOVA website. Your business name and page address are set by URBANOVA.
        </p>
      </div>
      <PartnerProfileForm
        initial={{
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
        }}
      />
    </div>
  )
}
