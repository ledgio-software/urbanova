import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let product = null
  let categories: { id: string; name: string }[] = []
  try {
    ;[product, categories] = await Promise.all([
      prisma.product.findUnique({
        where: { id },
        include: { variants: true, images: { orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    ])
  } catch {}

  if (!product) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black mb-8">Edit Product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
