import { ProductForm } from '@/components/admin/ProductForm'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  let categories: { id: string; name: string }[] = []
  try {
    categories = await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  } catch {}

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-2xl uppercase tracking-widest text-brand-black mb-8">New Product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
