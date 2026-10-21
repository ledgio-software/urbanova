import { prisma } from '@/lib/db'
import { policyTerms, siteConfig } from '@/lib/site-config'
import {
  communityCode,
  complaintsPolicy,
  donationsPolicy,
  membershipTerms,
  partnerPolicy,
  safeguardingPolicy,
  spotlightConsent,
  starterFundPolicy,
} from './movement-policies'
import { cookiePolicy, privacyPolicy, shippingReturns, termsOfSale, websiteTerms } from './store-policies'
import type { DeliveryZoneInfo, PolicyDoc } from './types'

async function loadZones(): Promise<DeliveryZoneInfo[]> {
  try {
    const zones = await prisma.deliveryZone.findMany({ orderBy: { fee: 'asc' } })
    return zones.map((z) => ({ name: z.name, estimatedDays: z.estimatedDays, fee: z.fee }))
  } catch {
    // DB unavailable (e.g. during build) — policy falls back to "shown at checkout" wording
    return []
  }
}

export async function getPolicy(slug: string): Promise<PolicyDoc | null> {
  const ctx = { cfg: siteConfig, t: policyTerms }
  switch (slug) {
    case 'terms-of-service':
      return termsOfSale({ ...ctx, zones: [] })
    case 'privacy-policy':
      return privacyPolicy({ ...ctx, zones: [] })
    case 'cookie-policy':
      return cookiePolicy({ ...ctx, zones: [] })
    case 'shipping-returns':
      return shippingReturns({ ...ctx, zones: await loadZones() })
    case 'website-terms':
      return websiteTerms({ ...ctx, zones: [] })
    case 'membership-terms':
      return membershipTerms(ctx)
    case 'spotlight-consent':
      return spotlightConsent(ctx)
    case 'partner-sponsorship':
      return partnerPolicy()
    case 'donations-fundraising':
      return donationsPolicy(ctx)
    case 'starter-fund':
      return starterFundPolicy(ctx)
    case 'safeguarding':
      return safeguardingPolicy(ctx)
    case 'community-code':
      return communityCode(ctx)
    case 'complaints':
      return complaintsPolicy(ctx)
    default:
      return null
  }
}
