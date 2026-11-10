import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSitePartner } from '@/lib/market-queries'
import { whatsappUrlFor } from '@/lib/phone'

export const metadata: Metadata = { title: 'About' }

export default async function PartnerSiteAbout({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params
  const partner = await getSitePartner(host)
  if (!partner) notFound()
  const whatsapp = whatsappUrlFor(partner.contactPhone)

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-headline text-display-md uppercase tracking-widest text-brand-black">About {partner.name}</h1>
      {partner.description && <p className="mt-6 whitespace-pre-line font-body leading-relaxed text-brand-black/70">{partner.description}</p>}
      {partner.type === 'stockist' && (
        <p className="mt-6 font-body text-sm text-brand-black/60">{partner.name} is an official URBANOVA stockist.</p>
      )}
      <section className="mt-10 space-y-2 border border-brand-black/10 p-6 font-body text-sm">
        <h2 className="font-headline text-xl uppercase tracking-widest text-brand-black">Contact</h2>
        {partner.location && <p className="text-brand-black/70">{partner.location}</p>}
        <p><a href={`tel:${partner.contactPhone}`} className="text-brand-black underline">{partner.contactPhone}</a></p>
        <p><a href={`mailto:${partner.contactEmail}`} className="text-brand-black underline">{partner.contactEmail}</a></p>
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block bg-brand-red px-5 py-2 text-xs uppercase tracking-widest text-white hover:bg-brand-red/80">
            Chat on WhatsApp
          </a>
        )}
      </section>
    </div>
  )
}
