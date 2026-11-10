import Link from 'next/link'
import { EMPTY_PARTNER, PartnerForm } from '@/components/admin/PartnerForm'
import { partnerRootDomain } from '@/lib/partner-hosts'

export default function NewPartnerPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <Link href="/admin/partners" className="text-xs font-body uppercase tracking-wider text-gray-500 hover:text-brand-black">
          ← Partners
        </Link>
        <h1 className="mt-2 font-headline text-2xl uppercase tracking-widest text-brand-black">Add Partner</h1>
      </div>
      <PartnerForm mode="new" initial={EMPTY_PARTNER} rootDomain={partnerRootDomain()} />
    </div>
  )
}
