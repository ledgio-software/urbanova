// Copy source: docs/URBANOVA_REFERENCE.md Part D.6 and Part E.5
import { prisma } from '@/lib/db'
import { CheckoutForm } from '@/components/storefront/CheckoutForm'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  let zones: { id: string; name: string; estimatedDays: string; fee: number }[] = []
  try {
    zones = await prisma.deliveryZone.findMany({ orderBy: { fee: 'asc' } })
  } catch {
    // DB unavailable — CheckoutForm will show empty zone list
  }

  return <CheckoutForm zones={zones} />
}
