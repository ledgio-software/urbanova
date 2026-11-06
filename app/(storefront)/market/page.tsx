import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ProductCard } from '@/components/storefront/ProductCard'
import { getLivePartners, getMarketCategoriesInUse, getMarketProducts } from '@/lib/market-queries'

// Copy source: Nova Market program, docs/approved/URBANOVA_Movement.md s.4
export const metadata: Metadata = {
  title: 'Nova Market',
  description: 'Products from the young founders and partner businesses of the URBANOVA Movement.',
}

export const revalidate = 60

export default async function MarketPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const [products, categories, partners] = await Promise.all([getMarketProducts(category), getMarketCategoriesInUse(), getLivePartners()])

  return (
    <div>
      <section className="bg-brand-navy text-brand-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-red">The URBANOVA Movement</p>
          <h1 className="mt-3 font-headline text-display-lg uppercase tracking-widest">Nova Market</h1>
          <p className="mt-4 max-w-2xl font-body text-brand-white/70">
            Products from the young founders and partner businesses of the URBANOVA Movement. Every order is paid securely through URBANOVA.
          </p>
        </div>
      </section>

      {partners.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <h2 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Partners</h2>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2" data-testid="market-partners">
            {partners.map((p) => (
              <Link key={p.id} href={`/partners/${p.slug}`} className="group w-36 shrink-0 text-center">
                <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-brand-black/10 bg-brand-navy/5">
                  {p.logoUrl ? (
                    <Image src={p.logoUrl} alt={p.name} fill sizes="80px" unoptimized={p.logoUrl.startsWith('data:')} className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center font-headline text-2xl text-brand-navy/40">{p.name.charAt(0)}</span>
                  )}
                </div>
                <p className="mt-2 font-body text-sm text-brand-black group-hover:text-brand-red">{p.name}</p>
                {p.location && <p className="font-body text-xs text-brand-black/40">{p.location}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {categories.length > 0 && (
          <nav className="mb-8 flex flex-wrap gap-2 font-body text-xs uppercase tracking-widest">
            <Link href="/market" className={`px-3 py-1.5 ${!category ? 'bg-brand-black text-white' : 'border border-brand-black/20 text-brand-black/70 hover:border-brand-black'}`}>All</Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/market?category=${c.slug}`}
                className={`px-3 py-1.5 ${category === c.slug ? 'bg-brand-black text-white' : 'border border-brand-black/20 text-brand-black/70 hover:border-brand-black'}`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        {products.length === 0 ? (
          <p className="font-body text-brand-black/60">Nothing here yet — try a different filter or check back for the next drop.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4" data-testid="market-products">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
