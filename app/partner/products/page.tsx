import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { requirePartnerPage } from '@/lib/dashboard-page'
import { ProductVisibilityToggle } from '@/components/partner/ProductVisibilityToggle'

export const dynamic = 'force-dynamic'

export default async function PartnerProductsPage() {
  const { partner } = await requirePartnerPage()
  const products = await prisma.product.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      variants: { select: { stockQuantity: true } },
    },
  })

  const statusOf = (p: (typeof products)[number]) => {
    if (p.adminHidden) return { label: 'Hidden by URBANOVA', tone: 'bg-red-100 text-red-800' }
    if (!p.isActive) return { label: 'Hidden', tone: 'bg-gray-200 text-gray-700' }
    if (partner.status !== 'active') return { label: 'Ready — page not live yet', tone: 'bg-amber-100 text-amber-800' }
    return { label: 'Live', tone: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black">Products</h1>
          <p className="mt-1 text-sm font-body text-gray-500">What you sell on Nova Market. Changes show on the site right away.</p>
        </div>
        <Link href="/partner/products/new" className="self-start bg-brand-red px-4 py-2 text-xs font-body font-semibold uppercase tracking-wider text-white hover:bg-brand-red/90 sm:self-auto">
          + Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="font-body text-sm text-gray-500">No products yet. Add your first one to start selling.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 bg-white font-body text-sm" data-testid="partner-products">
          {products.map((p) => {
            const stock = p.variants.reduce((n, v) => n + v.stockQuantity, 0)
            const status = statusOf(p)
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.images[0] && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/partner/products/${p.id}`} className="font-semibold text-brand-black hover:text-brand-red">{p.name}</Link>
                  <p className="text-xs text-gray-500">
                    {p.category.name} · {formatPrice(p.basePrice)} · {stock} in stock
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${status.tone}`}>{status.label}</span>
                <div className="flex gap-2">
                  {status.label === 'Live' && (
                    <Link href={`/product/${p.slug}`} target="_blank" className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50">View</Link>
                  )}
                  {!p.adminHidden && <ProductVisibilityToggle productId={p.id} isActive={p.isActive} />}
                  <Link href={`/partner/products/${p.id}`} className="border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50">Edit</Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
