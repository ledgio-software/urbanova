import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { storeProductWhere } from '@/lib/market'
import { requirePartnerPage } from '@/lib/dashboard-page'

export const dynamic = 'force-dynamic'

// Stockists pick the URBANOVA items they stock (Reference I.6).
export default async function UrbanovaCatalogPage() {
  const { partner } = await requirePartnerPage()
  if (partner.type !== 'stockist') redirect('/partner/products')

  const [items, mine] = await Promise.all([
    prisma.product.findMany({
      where: storeProductWhere,
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
      include: { category: { select: { name: true } }, images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    }),
    prisma.product.findMany({ where: { partnerId: partner.id, sourceProductId: { not: null } }, select: { id: true, sourceProductId: true } }),
  ])
  const listed = new Map(mine.map((m) => [m.sourceProductId, m.id]))

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <Link href="/partner/products" className="text-xs font-body uppercase tracking-wider text-gray-500 hover:text-brand-black">← Products</Link>
        <h1 className="mt-2 font-headline text-2xl uppercase tracking-widest text-brand-black">Add URBANOVA items</h1>
        <p className="mt-1 text-sm font-body text-gray-500">Choose the URBANOVA pieces you have in your shop. You set your price and how many of each size you have.</p>
      </div>
      {items.length === 0 ? (
        <p className="font-body text-sm text-gray-500">No URBANOVA items yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" data-testid="urbanova-catalog">
          {items.map((p) => {
            const copyId = listed.get(p.id)
            return (
              <li key={p.id} className="border border-gray-200 bg-white font-body text-sm">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.images[0] && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="space-y-2 p-3">
                  <p className="font-semibold text-brand-black">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.category.name} · {formatPrice(p.basePrice)}</p>
                  {copyId ? (
                    <Link href={`/partner/products/${copyId}`} className="block border border-gray-300 px-3 py-1.5 text-center text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50">
                      In your shop · Edit
                    </Link>
                  ) : (
                    <Link href={`/partner/products/urbanova/${p.id}`} className="block bg-brand-black px-3 py-1.5 text-center text-xs uppercase tracking-wider text-white hover:bg-brand-black/80">
                      Add to my shop
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
