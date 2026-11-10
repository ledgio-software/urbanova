import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { CheckoutForm } from '@/components/storefront/CheckoutForm'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

export default async function PartnerSiteCheckout() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { fee: 'asc' } }).catch(() => [])
  return <CheckoutForm zones={zones} />
}
