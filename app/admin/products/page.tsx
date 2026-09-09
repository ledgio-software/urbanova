import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

async function getProducts(q?: string, filter?: string) {
  try {
    const where: any = {}

    if (filter === 'featured') {
      where.featured = true
    }

    if (q && q.trim()) {
      const query = q.trim()
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ]
    }

    let products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        variants: { select: { sku: true, stockQuantity: true, size: true, color: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (filter === 'low_stock') {
      products = products.filter((p) => p.variants.some((v) => v.stockQuantity <= 3))
    }

    return products
  } catch (err) {
    console.error('Failed to fetch products:', err)
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  const { q, filter } = await searchParams
  const products = await getProducts(q, filter)

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Products</h1>
          <p className="text-xs font-body text-gray-500 mt-1">
            Showing {products.length} product{products.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Form */}
          <form method="GET" className="flex items-center gap-2">
            {filter && <input type="hidden" name="filter" value={filter} />}
            <input
              type="text"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search product name or category..."
              className="border border-gray-200 px-3 py-2 text-xs font-body focus:outline-none focus:border-brand-black w-56 sm:w-64 bg-white"
            />
            <button
              type="submit"
              className="bg-brand-black text-white text-xs font-body uppercase tracking-wider px-3.5 py-2 hover:bg-brand-black/80 transition-colors"
            >
              Search
            </button>
          </form>

          <Link
            href="/admin/products/new"
            className="bg-brand-red text-white text-xs font-body uppercase tracking-widest px-4 py-2 hover:bg-brand-red/80 transition-colors font-semibold shadow-sm flex-shrink-0"
          >
            + New Product
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'All Products' },
          { value: 'featured', label: 'Featured ⭐' },
          { value: 'low_stock', label: 'Low Stock Urgency ⚠️' },
        ].map((f) => {
          const params = new URLSearchParams()
          if (f.value) params.set('filter', f.value)
          if (q) params.set('q', q)
          const href = `/admin/products${params.toString() ? `?${params.toString()}` : ''}`
          const active = (filter ?? '') === f.value

          return (
            <Link
              key={f.value}
              href={href}
              className={`px-3.5 py-1.5 text-xs font-body uppercase tracking-wider rounded border transition-colors ${
                active
                  ? 'bg-brand-black text-white border-brand-black font-semibold'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Product</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Category</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Base Price</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Total Stock</th>
              <th className="text-center px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Featured</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No products found matching your search.
                </td>
              </tr>
            )}
            {products.map((p) => {
              const totalStock = p.variants.reduce((s, v) => s + v.stockQuantity, 0)
              const mainImage = p.images[0]?.url
              const isLowStock = totalStock <= 5

              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-brand-black flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 relative">
                      {mainImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={mainImage} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                          No Pic
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-black">{p.name}</p>
                      <p className="text-xs text-gray-400 font-mono">/shop/{p.category.name.toLowerCase()}/{p.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(p.basePrice)}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        totalStock === 0
                          ? 'bg-red-100 text-red-800'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-gray-700 bg-gray-100'
                      }`}
                    >
                      {totalStock} in stock
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.featured ? <span className="text-brand-red font-bold">★ Yes</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-block px-3 py-1.5 text-xs font-body font-semibold uppercase tracking-wider text-brand-black bg-gray-100 hover:bg-brand-black hover:text-white rounded transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
