// Copy source: docs/URBANOVA_REFERENCE.md Part D, Section D.4 and Part E, Section E.3
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getProductBySlug, getFeaturedProducts, type ProductSummary } from '@/lib/products'
import { ProductCard } from '@/components/storefront/ProductCard'
import { AddToCartForm } from '@/components/storefront/AddToCartForm'
import { MarketAddToCartForm } from '@/components/storefront/MarketAddToCartForm'
import { getMoreFromPartner } from '@/lib/market-queries'
import { formatPrice } from '@/lib/format'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  const image = product.images[0]?.url
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: `${product.name} | URBANOVA`,
      description: product.description.slice(0, 155),
      images: image ? [{ url: image }] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, related] = await Promise.all([
    getProductBySlug(slug),
    getFeaturedProducts(),
  ])

  if (!product) notFound()

  // Nova Market items show more from the same partner; URBANOVA items show featured clothing
  const relatedProducts = product.partnerId
    ? await getMoreFromPartner(product.partnerId, product.id)
    : related.filter((p: ProductSummary) => p.id !== product.id).slice(0, 4)
  const mainImage = product.images[0]?.url ?? null
  // URBANOVA stockists are paid directly by the customer (Reference I.6)
  const stockist = product.partner?.type === 'stockist' ? product.partner : null
  const seller = stockist ? { id: stockist.id, name: stockist.name } : undefined
  const variantProps = product.variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    stockQuantity: v.stockQuantity,
    priceOverride: v.priceOverride,
    sku: v.sku,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs font-body uppercase tracking-widest text-brand-black/40 mb-8">
        {product.partner ? (
          <>
            {!stockist && (
              <>
                <Link href="/market" className="hover:text-brand-red transition-colors">Nova Market</Link>
                {' / '}
              </>
            )}
            <Link href={`/partners/${product.partner.slug}`} className="hover:text-brand-red transition-colors">{product.partner.name}</Link>
          </>
        ) : (
          <>
            <Link href="/shop" className="hover:text-brand-red transition-colors">Shop</Link>
            {' / '}
            <Link href={`/shop/${product.category.slug}`} className="hover:text-brand-red transition-colors">{product.category.name}</Link>
          </>
        )}
        {' / '}
        <span className="text-brand-black">{product.name}</span>
      </p>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-brand-white rounded overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/5">
                <span className="font-headline text-8xl text-brand-navy/20 uppercase">U</span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img) => (
                <div key={img.id} className="relative aspect-square bg-brand-white rounded overflow-hidden">
                  <Image src={img.url} alt={product.name} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="mt-8 lg:mt-0">
          <h1 className="font-headline text-display-md uppercase text-brand-black">{product.name}</h1>
          {product.sourceProductId && (
            <span className="mt-2 inline-block bg-brand-black px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-white" data-testid="official-badge">
              Official URBANOVA
            </span>
          )}
          {stockist ? (
            <p className="mt-2 font-body text-sm text-brand-black/60" data-testid="sold-by">
              Sold by{' '}
              <Link href={`/partners/${stockist.slug}`} className="font-semibold text-brand-black underline underline-offset-4 hover:text-brand-red">
                {stockist.name}
              </Link>
              , an URBANOVA stockist · You pay {stockist.name} directly
            </p>
          ) : product.partner && (
            <p className="mt-2 font-body text-sm text-brand-black/60" data-testid="sold-by">
              Sold by{' '}
              <Link href={`/partners/${product.partner.slug}`} className="font-semibold text-brand-black underline underline-offset-4 hover:text-brand-red">
                {product.partner.name}
              </Link>{' '}
              on Nova Market · Paid securely through URBANOVA
            </p>
          )}
          <p className="mt-1 font-headline text-2xl text-brand-black">{formatPrice(product.basePrice)}</p>
          <p className="mt-6 font-body text-brand-black/70 leading-relaxed">{product.description}</p>

          <div className="mt-8">
            {product.partner && !product.sourceProductId ? (
              <MarketAddToCartForm
                productId={product.id}
                productName={product.name}
                basePrice={product.basePrice}
                variants={variantProps}
                imageUrl={mainImage ?? undefined}
                seller={seller}
              />
            ) : (
            <AddToCartForm
              productId={product.id}
              productName={product.name}
              basePrice={product.basePrice}
              variants={variantProps}
              imageUrl={mainImage ?? undefined}
              seller={seller}
            />
            )}
          </div>

          <p className="mt-6 text-xs font-body text-brand-black/40 uppercase tracking-widest">
            Secure checkout. Your details are safe with us.
          </p>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="font-headline text-display-md uppercase text-brand-black mb-8">
            {product.partner ? `More from ${product.partner.name}` : 'You May Also Like'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
