import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/storefront/ProductCard'
import { getLivePartnerPage } from '@/lib/market-queries'
import { whatsappUrlFor } from '@/lib/phone'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const partner = await getLivePartnerPage(slug)
  if (!partner) return {}
  return {
    title: partner.type === 'stockist' ? `${partner.name} — URBANOVA Stockist` : `${partner.name} — Nova Market`,
    description: partner.tagline ?? (partner.type === 'stockist' ? `Official URBANOVA stockist ${partner.name}.` : `${partner.name} on URBANOVA Nova Market.`),
    openGraph: partner.bannerUrl && !partner.bannerUrl.startsWith('data:') ? { images: [{ url: partner.bannerUrl }] } : undefined,
  }
}

// Public partner page — only for live partners (pending/suspended → 404).
export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const partner = await getLivePartnerPage(slug)
  if (!partner) notFound()

  const dataUrl = (u: string | null) => Boolean(u?.startsWith('data:'))
  const stockist = partner.type === 'stockist'
  const official = partner.products.filter((p) => p.sourceProductId)
  const own = partner.products.filter((p) => !p.sourceProductId)
  const whatsapp = stockist ? whatsappUrlFor(partner.contactPhone) : undefined
  const grid = (items: typeof partner.products, testId: string) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4" data-testid={testId}>
      {items.map((p, i) => (
        <ProductCard key={p.id} product={{ ...p, partner: null }} priority={i < 4} />
      ))}
    </div>
  )

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-brand-navy text-brand-white">
        {partner.bannerUrl && (
          <>
            <Image src={partner.bannerUrl} alt="" fill priority sizes="100vw" unoptimized={dataUrl(partner.bannerUrl)} className="-z-20 object-cover" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/30" />
          </>
        )}
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-10 pt-24 sm:flex-row sm:items-end sm:px-6 lg:px-8">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-brand-white bg-brand-white">
            {partner.logoUrl ? (
              <Image src={partner.logoUrl} alt={partner.name} fill sizes="96px" unoptimized={dataUrl(partner.logoUrl)} className="object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center font-headline text-4xl text-brand-navy">{partner.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-red">
              {stockist ? (
                <span data-testid="stockist-badge">Official URBANOVA Stockist</span>
              ) : (
                <Link href="/market" className="hover:underline">Nova Market</Link>
              )}
            </p>
            <h1 className="mt-1 font-headline text-display-md uppercase tracking-widest">{partner.name}</h1>
            {partner.tagline && <p className="mt-1 font-body text-brand-white/80">{partner.tagline}</p>}
            {partner.location && <p className="mt-1 font-body text-sm text-brand-white/50">{partner.location}</p>}
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-brand-red px-5 py-2 font-body text-xs uppercase tracking-widest text-white hover:bg-brand-red/80"
              >
                WhatsApp {partner.name}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {partner.description && (
          <section className="mb-12 max-w-3xl">
            <h2 className="font-headline text-2xl uppercase tracking-widest text-brand-black">About</h2>
            <p className="mt-3 whitespace-pre-line font-body leading-relaxed text-brand-black/70">{partner.description}</p>
          </section>
        )}

        {partner.products.length === 0 ? (
          <>
            <h2 className="mb-6 font-headline text-2xl uppercase tracking-widest text-brand-black">Shop {partner.name}</h2>
            <p className="font-body text-brand-black/60">Nothing here yet — check back for the next drop.</p>
          </>
        ) : stockist ? (
          <div className="space-y-12">
            {official.length > 0 && (
              <section>
                <h2 className="mb-6 font-headline text-2xl uppercase tracking-widest text-brand-black">URBANOVA at {partner.name}</h2>
                {grid(official, 'stockist-urbanova-products')}
              </section>
            )}
            {own.length > 0 && (
              <section>
                <h2 className="mb-6 font-headline text-2xl uppercase tracking-widest text-brand-black">Also from {partner.name}</h2>
                {grid(own, 'stockist-own-products')}
              </section>
            )}
          </div>
        ) : (
          <>
            <h2 className="mb-6 font-headline text-2xl uppercase tracking-widest text-brand-black">Shop {partner.name}</h2>
            {grid(partner.products, 'partner-products-public')}
          </>
        )}
      </div>
    </div>
  )
}
