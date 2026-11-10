import { ProductCard } from '@/components/storefront/ProductCard'
import type { LivePartnerPage } from '@/lib/market-queries'

// A partner's products: stockists get "URBANOVA at …" and "Also from …"; Nova Market partners one grid.
// Used on /partners/[slug] and on the partner's own website.
export function PartnerProductSections({ partner }: { partner: Pick<LivePartnerPage, 'name' | 'type' | 'products'> }) {
  const grid = (items: LivePartnerPage['products'], testId: string) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4" data-testid={testId}>
      {items.map((p, i) => (
        <ProductCard key={p.id} product={{ ...p, partner: null }} priority={i < 4} />
      ))}
    </div>
  )
  const heading = (text: string) => <h2 className="mb-6 font-headline text-2xl uppercase tracking-widest text-brand-black">{text}</h2>

  if (partner.products.length === 0) {
    return (
      <>
        {heading(`Shop ${partner.name}`)}
        <p className="font-body text-brand-black/60">Nothing here yet — check back for the next drop.</p>
      </>
    )
  }
  if (partner.type !== 'stockist') {
    return (
      <>
        {heading(`Shop ${partner.name}`)}
        {grid(partner.products, 'partner-products-public')}
      </>
    )
  }
  const official = partner.products.filter((p) => p.sourceProductId)
  const own = partner.products.filter((p) => !p.sourceProductId)
  return (
    <div className="space-y-12">
      {official.length > 0 && (
        <section>
          {heading(`URBANOVA at ${partner.name}`)}
          {grid(official, 'stockist-urbanova-products')}
        </section>
      )}
      {own.length > 0 && (
        <section>
          {heading(`Also from ${partner.name}`)}
          {grid(own, 'stockist-own-products')}
        </section>
      )}
    </div>
  )
}
