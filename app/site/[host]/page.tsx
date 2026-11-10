import { notFound } from 'next/navigation'
import Image from 'next/image'
import { PartnerProductSections } from '@/components/storefront/PartnerProductSections'
import { getSitePartner } from '@/lib/market-queries'

// Partner website home: banner, name, products.
export default async function PartnerSiteHome({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params
  const partner = await getSitePartner(host)
  if (!partner) notFound()
  const dataUrl = Boolean(partner.bannerUrl?.startsWith('data:'))

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-brand-navy text-brand-white">
        {partner.bannerUrl && (
          <>
            <Image src={partner.bannerUrl} alt="" fill priority sizes="100vw" unoptimized={dataUrl} className="-z-20 object-cover" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/30" />
          </>
        )}
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
          {partner.type === 'stockist' && (
            <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-red">Official URBANOVA Stockist</p>
          )}
          <h1 className="mt-1 font-headline text-display-md uppercase tracking-widest">{partner.name}</h1>
          {partner.tagline && <p className="mt-2 max-w-2xl font-body text-brand-white/80">{partner.tagline}</p>}
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PartnerProductSections partner={partner} />
      </div>
    </div>
  )
}
