import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCartForm } from '@/components/storefront/AddToCartForm'
import { MarketAddToCartForm } from '@/components/storefront/MarketAddToCartForm'
import { formatPrice } from '@/lib/format'
import { getSitePartner } from '@/lib/market-queries'
import { getProductBySlug } from '@/lib/products'

type Params = { params: Promise<{ host: string; slug: string }> }

// Only this partner's live products are shown on their website.
async function load({ params }: Params) {
  const { host, slug } = await params
  const partner = await getSitePartner(host)
  const product = partner ? await getProductBySlug(slug) : null
  if (!partner || !product || product.partnerId !== partner.id) return null
  return { partner, product }
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const data = await load(props)
  if (!data) return {}
  const { product } = data
  const image = product.images.find((i) => !i.url.startsWith('data:'))?.url
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description: product.description.slice(0, 160), ...(image ? { images: [{ url: image }] } : {}) },
  }
}

export default async function PartnerSiteProduct(props: Params) {
  const data = await load(props)
  if (!data) notFound()
  const { partner, product } = data
  const stockist = partner.type === 'stockist'
  const seller = stockist ? { id: partner.id, name: partner.name } : undefined
  const mainImage = product.images[0]?.url ?? null
  const variants = product.variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    stockQuantity: v.stockQuantity,
    priceOverride: v.priceOverride,
    sku: v.sku,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mb-8 font-body text-xs uppercase tracking-widest text-brand-black/40">
        <Link href="/" className="hover:text-brand-red">{partner.name}</Link> / <span className="text-brand-black">{product.name}</span>
      </p>
      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded bg-brand-white">
            {mainImage ? (
              <Image src={mainImage} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" unoptimized={mainImage.startsWith('data:')} className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/5 font-headline text-8xl uppercase text-brand-navy/20">{partner.name.charAt(0)}</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded bg-brand-white">
                  <Image src={img.url} alt={product.name} fill sizes="25vw" unoptimized={img.url.startsWith('data:')} className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 lg:mt-0">
          {product.sourceProductId && (
            <span className="inline-block bg-brand-black px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-white" data-testid="official-badge">
              Official URBANOVA
            </span>
          )}
          <h1 className="mt-2 font-headline text-display-md uppercase text-brand-black">{product.name}</h1>
          <p className="mt-1 font-headline text-2xl text-brand-black">{formatPrice(product.basePrice)}</p>
          <p className="mt-6 whitespace-pre-line font-body leading-relaxed text-brand-black/70">{product.description}</p>
          <div className="mt-8">
            {product.sourceProductId ? (
              <AddToCartForm productId={product.id} productName={product.name} basePrice={product.basePrice} variants={variants} imageUrl={mainImage ?? undefined} seller={seller} />
            ) : (
              <MarketAddToCartForm productId={product.id} productName={product.name} basePrice={product.basePrice} variants={variants} imageUrl={mainImage ?? undefined} seller={seller} />
            )}
          </div>
          <p className="mt-6 font-body text-xs text-brand-black/50">
            {stockist ? `Sold and delivered by ${partner.name}. You pay ${partner.name} directly.` : `Sold by ${partner.name}. Secure checkout by URBANOVA.`}
          </p>
        </div>
      </div>
    </div>
  )
}
