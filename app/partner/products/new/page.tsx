import Link from 'next/link'
import { requirePartnerPage } from '@/lib/dashboard-page'
import { getMarketCategories } from '@/lib/partner-catalog'
import { PartnerProductForm } from '@/components/partner/PartnerProductForm'

export const dynamic = 'force-dynamic'

export default async function NewPartnerProductPage() {
  await requirePartnerPage()
  const categories = await getMarketCategories()

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <Link href="/partner/products" className="text-xs font-body uppercase tracking-wider text-gray-500 hover:text-brand-black">← Products</Link>
        <h1 className="mt-2 font-headline text-2xl uppercase tracking-widest text-brand-black">Add product</h1>
      </div>
      {categories.length === 0 ? (
        <p className="font-body text-sm text-gray-600">URBANOVA is still setting up Nova Market categories. Please check back soon.</p>
      ) : (
        <PartnerProductForm
          categories={categories}
          initial={{ name: '', categoryId: '', price: '', description: '', isActive: true, images: [], variants: [{ size: '', color: '', stock: '1', price: '' }] }}
        />
      )}
    </div>
  )
}
