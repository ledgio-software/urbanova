import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CartCount } from '@/components/storefront/CartCount'
import { getSitePartner } from '@/lib/market-queries'
import { normalizeHost } from '@/lib/partner-hosts'
import { whatsappUrlFor } from '@/lib/phone'
import { getSiteUrl } from '@/lib/site-url'

// A partner's own website (Reference I.7): their branding, their products, URBANOVA checkout underneath.
// Reached only through the partner's address — middleware rewrites <host>/... to /site/<host>/...

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ host: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { host } = await params
  const partner = await getSitePartner(host)
  if (!partner) return { title: 'Shop not found', robots: { index: false } }
  const image = [partner.bannerUrl, partner.logoUrl].find((u) => u && !u.startsWith('data:'))
  const description =
    partner.tagline ?? (partner.type === 'stockist' ? `${partner.name} — official URBANOVA stockist.` : `Shop ${partner.name} online.`)
  return {
    title: { absolute: partner.name, template: `%s | ${partner.name}` },
    description,
    // The partner's own domain is the main address when they have one (search engines index that one)
    metadataBase: new URL(`https://${partner.customDomain ?? normalizeHost(decodeURIComponent(host))}`),
    alternates: { canonical: '/' },
    openGraph: { siteName: partner.name, title: partner.name, description, type: 'website', locale: 'en_GH', ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: 'summary_large_image', site: undefined },
    appleWebApp: { capable: true, title: partner.name, statusBarStyle: 'black-translucent' },
  }
}

export default async function PartnerSiteLayout({ children, params }: { children: React.ReactNode } & Params) {
  const { host } = await params
  const partner = await getSitePartner(host)
  if (!partner) notFound()

  const stockist = partner.type === 'stockist'
  const whatsapp = whatsappUrlFor(partner.contactPhone)
  const dataUrl = Boolean(partner.logoUrl?.startsWith('data:'))
  const nav = [
    { href: '/', label: 'Shop' },
    { href: '/about', label: 'About' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-brand-white" data-testid="partner-site">
      <header className="sticky top-0 z-40 bg-brand-navy text-brand-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-white">
              {partner.logoUrl ? (
                <Image src={partner.logoUrl} alt="" fill sizes="40px" unoptimized={dataUrl} className="object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center font-headline text-xl text-brand-navy">{partner.name.charAt(0)}</span>
              )}
            </span>
            <span className="truncate font-headline text-xl uppercase tracking-widest" data-testid="site-name">{partner.name}</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 font-body text-xs uppercase tracking-widest sm:gap-6">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-brand-white/80 hover:text-brand-white">{n.label}</Link>
            ))}
            <Link href="/cart" aria-label="Cart" className="relative p-1 text-brand-white/80 hover:text-brand-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <CartCount />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-brand-navy text-brand-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 font-body text-sm sm:grid-cols-2 sm:px-6 lg:px-8">
          <div>
            <p className="font-headline text-xl uppercase tracking-widest">{partner.name}</p>
            {partner.tagline && <p className="mt-1 text-brand-white/60">{partner.tagline}</p>}
            {partner.location && <p className="mt-1 text-brand-white/60">{partner.location}</p>}
          </div>
          <div className="space-y-2 sm:text-right">
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="block hover:text-brand-red">WhatsApp {partner.contactPhone}</a>
            )}
            <a href={`mailto:${partner.contactEmail}`} className="block hover:text-brand-red">{partner.contactEmail}</a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 font-body text-xs text-brand-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} {partner.name}</p>
            <p data-testid="powered-by">
              {stockist ? 'Official URBANOVA Stockist · ' : ''}
              <a href={getSiteUrl()} className="underline hover:text-brand-white">Powered by URBANOVA</a>
              {' · '}
              <a href={`${getSiteUrl()}/legal/terms-of-service`} className="underline hover:text-brand-white">Terms</a>
              {' · '}
              <a href={`${getSiteUrl()}/legal/privacy-policy`} className="underline hover:text-brand-white">Privacy</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
