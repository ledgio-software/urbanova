import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'

type Props = {
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    images: { url: string; sortOrder: number }[]
    variants: { priceOverride: number | null; stockQuantity: number }[]
  }
}

export function ProductCard({ product }: Props) {
  const imageUrl = product.images[0]?.url ?? null
  const inStock = product.variants.some((v) => v.stockQuantity > 0)

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-brand-white aspect-[3/4] rounded">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/10">
            <span className="font-headline text-4xl text-brand-navy/20 uppercase tracking-widest">U</span>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-brand-black/40 flex items-center justify-center">
            <span className="bg-brand-navy text-brand-white/80 text-xs uppercase tracking-widest px-3 py-1 font-body">
              Sold Out
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-brand-navy/90 py-3 px-4">
          <p className="text-xs text-brand-white uppercase tracking-widest font-body text-center">
            View Product
          </p>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm font-body text-brand-black dark:text-brand-white uppercase tracking-wide leading-tight">
          {product.name}
        </p>
        <p className="mt-1 text-sm font-body text-brand-black/70 dark:text-brand-white/60">
          {formatPrice(product.basePrice)}
        </p>
      </div>
    </Link>
  )
}
