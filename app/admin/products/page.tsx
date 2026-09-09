import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        variants: { select: { stockQuantity: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-brand-red text-white text-xs font-body uppercase tracking-widest px-4 py-2 hover:bg-brand-red/80 transition-colors"
        >
          + New Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Product</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Category</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Base Price</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Stock</th>
              <th className="text-center px-4 py-3 text-xs uppercase tracking-widest text-gray-500">Featured</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products yet.</td>
              </tr>
            )}
            {products.map((p) => {
              const totalStock = p.variants.reduce((s, v) => s + v.stockQuantity, 0)
              const mainImage = p.images[0]?.url
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-brand-black flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 relative">
                      {mainImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={mainImage} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-300 uppercase">
                          No Pic
                        </div>
                      )}
                    </div>
                    <span>{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category.name}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(p.basePrice)}</td>
                  <td className={`px-4 py-3 text-right ${totalStock === 0 ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                    {totalStock}
                  </td>
                  <td className="px-4 py-3 text-center">{p.featured ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-xs text-brand-black hover:underline font-medium">
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
