// Copy source: docs/URBANOVA_REFERENCE.md Part D, Section D.3 and Part E, Section E.2
import Link from 'next/link'
import { getProducts, getCategories, type ProductSummary, type CategoryRow } from '@/lib/products'
import { ProductCard } from '@/components/storefront/ProductCard'

export const revalidate = 60

type Props = {
  searchParams: Promise<{ category?: string; size?: string; color?: string; sort?: string }>
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low – High' },
  { value: 'price_desc', label: 'Price: High – Low' },
]

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getProducts({ category: params.category, size: params.size, color: params.color, sort: params.sort }),
    getCategories(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-headline text-display-lg uppercase text-brand-black">The Full Collection</h1>
        <p className="mt-2 font-body text-brand-black/60">Every piece built for the bold. Find your fit.</p>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
        {/* Filters sidebar */}
        <aside>
          <div className="space-y-8 lg:sticky lg:top-24">
            {/* Category filter */}
            <div>
              <p className="text-xs font-body uppercase tracking-widest text-brand-black/40 mb-3">Category</p>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/shop"
                    className={`text-sm font-body ${!params.category ? 'text-brand-red font-semibold' : 'text-brand-black/70 hover:text-brand-black'} transition-colors`}
                  >
                    All
                  </Link>
                </li>
                {categories.map((cat: CategoryRow) => (
                  <li key={cat.id}>
                    <Link
                      href={`/shop?category=${cat.slug}${params.size ? `&size=${params.size}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
                      className={`text-sm font-body ${params.category === cat.slug ? 'text-brand-red font-semibold' : 'text-brand-black/70 hover:text-brand-black'} transition-colors`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Size filter */}
            <div>
              <p className="text-xs font-body uppercase tracking-widest text-brand-black/40 mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <Link
                    key={size}
                    href={`/shop?${params.category ? `category=${params.category}&` : ''}size=${size}${params.sort ? `&sort=${params.sort}` : ''}`}
                    className={`text-xs font-body border px-2 py-1 transition-colors ${params.size === size ? 'border-brand-red text-brand-red' : 'border-brand-black/20 text-brand-black/60 hover:border-brand-black'}`}
                  >
                    {size}
                  </Link>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {(params.category || params.size || params.sort) && (
              <Link
                href="/shop"
                className="text-xs font-body uppercase tracking-widest text-brand-red hover:text-brand-black transition-colors"
              >
                Clear filters ×
              </Link>
            )}
          </div>
        </aside>

        {/* Product grid */}
        <div>
          {/* Sort + count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-body text-brand-black/50">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs font-body uppercase tracking-widest text-brand-black/40 hidden sm:block">Sort</label>
              <select
                id="sort"
                defaultValue={params.sort ?? 'newest'}
                className="text-sm font-body border border-brand-black/20 bg-transparent px-3 py-1.5 focus:outline-none focus:border-brand-black"
                onChange={undefined}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-body text-brand-black/50">Nothing here yet — try a different filter or check back for the next drop.</p>
              <Link href="/shop" className="mt-4 inline-block text-brand-red text-sm font-body uppercase tracking-widest hover:text-brand-black transition-colors">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product: ProductSummary) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
