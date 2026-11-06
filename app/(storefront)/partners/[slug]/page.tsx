import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/storefront/ProductCard'
import { getLivePartnerPage } from '@/lib/market-queries'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const partner = await getLivePartnerPage(slug)
  if (!partner) return {}
  return {
    title: `${partner.name} — Nova Market`,
    description: partner.tagline ?? `${partner.name} on URBANOVA Nova Market.`,
    openGraph: partner.bannerUrl && !partner.bannerUrl.startsWith('data:') ? { images: [{ url: partner.bannerUrl }] } : undefined,
  }
}

// Public partner page — only for live partners (pending/suspended → 404).
export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const partner = await getLivePartnerPage(slug)
  if (!partner) notFound()

  const dataUrl = (u: string | null) => Boolean(u?.startsWith('data:'))

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
              <Link href="/market" className="hover:underline">Nova Market</Link>
            </p>
            <h1 className="mt-1 font-headline text-display-md uppercase tracking-widest">{partner.name}</h1>
            {partner.tagline && <p className="mt-1 font-body text-brand-white/80">{partner.tagline}</p>}
            {partner.location && <p className="mt-1 font-body text-sm text-brand-white/50">{partner.location}</p>}
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

        <h2 className="mb-6 font-headline text-2xl uppercase tracking-widest text-brand-black">Shop {partner.name}</h2>
        {partner.products.length === 0 ? (
          <p className="font-body text-brand-black/60">Nothing here yet — check back for the next drop.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4" data-testid="partner-products-public">
            {partner.products.map((p, i) => (
              <ProductCard key={p.id} product={{ ...p, partner: null }} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
