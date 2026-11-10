import type { Metadata } from 'next'
import { CartView } from '@/components/storefront/CartView'

export const metadata: Metadata = { title: 'Cart', robots: { index: false } }

export default function PartnerSiteCart() {
  return <CartView />
}
