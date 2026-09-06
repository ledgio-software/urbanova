// Copy source: docs/URBANOVA_REFERENCE.md Part D, Section D.3 and Part E, Section E.2
import { notFound } from 'next/navigation'
import { getProducts, getCategories, type ProductSummary, type CategoryRow } from '@/lib/products'
import { ProductCard } from '@/components/storefront/ProductCard'
import Link from 'next/link'

export const revalidate = 60

const CATEGORY_HEADERS: Record<string, { title: string; sub: string }> = {
  't-shirts': { title: 'Classics with an Edge', sub: 'Everyday tees, city-coded.' },
  hoodies: { title: 'Heavyweight Energy', sub: 'Built for cool nights and bold moves.' },
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const [products, categories] = await Promise.all([
    getProducts({ category }),
    getCategories(),
  ])

  const cat = categories.find((c: CategoryRow) => c.slug === category)
  if (!cat) notFound()

  const header = CATEGORY_HEADERS[category] ?? { title: cat.name, sub: '' }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs font-body uppercase tracking-widest text-brand-red mb-2">
          <Link href="/shop" className="hover:text-brand-black transition-colors">Shop</Link> / {cat.name}
        </p>
        <h1 className="font-headline text-display-lg uppercase text-brand-black">{header.title}</h1>
        {header.sub && <p className="mt-2 font-body text-brand-black/60">{header.sub}</p>}
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-body text-brand-black/50">Nothing here yet — check back for the next drop.</p>
          <Link href="/shop" className="mt-4 inline-block text-brand-red text-sm font-body uppercase tracking-widest hover:text-brand-black transition-colors">
            View All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product: ProductSummary) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
