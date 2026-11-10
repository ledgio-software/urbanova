import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { storeProductWhere } from '@/lib/market'
import { requirePartnerPage } from '@/lib/dashboard-page'
import { OfficialItemForm } from '@/components/partner/OfficialItemForm'

export const dynamic = 'force-dynamic'

export default async function AddUrbanovaItemPage({ params }: { params: Promise<{ sourceId: string }> }) {
  const { partner } = await requirePartnerPage()
  if (partner.type !== 'stockist') redirect('/partner/products')
  const { sourceId } = await params

  const existing = await prisma.product.findFirst({ where: { partnerId: partner.id, sourceProductId: sourceId }, select: { id: true } })
  if (existing) redirect(`/partner/products/${existing.id}`)

  const source = await prisma.product.findFirst({
    where: { id: sourceId, ...storeProductWhere },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
  })
  if (!source) notFound()

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <Link href="/partner/products/urbanova" className="text-xs font-body uppercase tracking-wider text-gray-500 hover:text-brand-black">← URBANOVA items</Link>
        <h1 className="mt-2 font-headline text-2xl uppercase tracking-widest text-brand-black">Add to my shop</h1>
      </div>
      <OfficialItemForm
        sourceProductId={source.id}
        name={source.name}
        imageUrl={source.images[0]?.url ?? null}
        urbanovaPrice={source.basePrice}
        initial={{
          price: (source.basePrice / 100).toFixed(2),
          isActive: true,
          rows: source.variants.map((v) => ({ sourceVariantId: v.id, size: v.size, color: v.color, stock: '0' })),
        }}
      />
    </div>
  )
}
