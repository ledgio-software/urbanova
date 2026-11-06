import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requirePartnerPage } from '@/lib/dashboard-page'
import { getMarketCategories } from '@/lib/partner-catalog'
import { PartnerProductForm } from '@/components/partner/PartnerProductForm'

export const dynamic = 'force-dynamic'

const ghs = (pesewas: number) => (pesewas / 100).toFixed(2)

export default async function EditPartnerProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { partner } = await requirePartnerPage()
  const { id } = await params
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } }, variants: { orderBy: [{ size: 'asc' }, { color: 'asc' }] } },
    }),
    getMarketCategories(),
  ])
  if (!product || product.partnerId !== partner.id) notFound()

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <Link href="/partner/products" className="text-xs font-body uppercase tracking-wider text-gray-500 hover:text-brand-black">← Products</Link>
        <h1 className="mt-2 font-headline text-2xl uppercase tracking-widest text-brand-black">{product.name}</h1>
        {product.adminHidden && (
          <p className="mt-2 border border-amber-300 bg-amber-50 p-3 font-body text-sm text-amber-900">
            URBANOVA has hidden this product from Nova Market. Contact URBANOVA to find out why.
          </p>
        )}
      </div>
      <PartnerProductForm
        productId={product.id}
        categories={categories}
        initial={{
          name: product.name,
          categoryId: product.categoryId,
          price: ghs(product.basePrice),
          description: product.description,
          isActive: product.isActive,
          images: product.images.map((i) => i.url),
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size === 'One size' ? '' : v.size,
            color: v.color === 'Standard' ? '' : v.color,
            stock: String(v.stockQuantity),
            price: v.priceOverride === null ? '' : ghs(v.priceOverride),
          })),
        }}
      />
    </div>
  )
}
