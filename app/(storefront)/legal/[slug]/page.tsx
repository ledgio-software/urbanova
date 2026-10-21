import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PolicyDocument } from '@/components/storefront/PolicyDocument'
import { getPolicy } from '@/lib/content/policies'
import { POLICY_SLUGS } from '@/lib/content/policy-index'
import { siteConfig } from '@/lib/site-config'

// Shipping zones come from the delivery_zones table, so re-render periodically after admin edits.
export const revalidate = 300

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const doc = await getPolicy(slug)
  if (!doc) return {}
  return { title: doc.title, description: doc.description }
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = await getPolicy(slug)
  if (!doc) notFound()
  return <PolicyDocument doc={doc} effectiveDate={siteConfig.policyEffectiveDate} />
}
