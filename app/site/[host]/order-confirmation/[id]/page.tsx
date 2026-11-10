import type { Metadata } from 'next'
import OrderConfirmationPage from '@/app/(storefront)/order-confirmation/[id]/page'

export const metadata: Metadata = { title: 'Your order', robots: { index: false } }

// Same confirmation as the main site (payment details follow the order's seller); links resolve on this host.
export default async function PartnerSiteConfirmation({ params }: { params: Promise<{ host: string; id: string }> }) {
  const { id } = await params
  return OrderConfirmationPage({ params: Promise.resolve({ id }) })
}
