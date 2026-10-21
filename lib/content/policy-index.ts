// Slugs and link titles for policy pages. Kept free of DB imports so any component can use it.

// Order here drives the footer and the policy index. Slugs under /legal/[slug].
// Slugs shipping-returns, privacy-policy and terms-of-service pre-date this file and stay stable.
export const STORE_POLICY_SLUGS = [
  'terms-of-service',
  'privacy-policy',
  'cookie-policy',
  'shipping-returns',
  'website-terms',
] as const
export const MOVEMENT_POLICY_SLUGS = [
  'membership-terms',
  'spotlight-consent',
  'partner-sponsorship',
  'donations-fundraising',
  'starter-fund',
  'safeguarding',
  'community-code',
  'complaints',
] as const

export const POLICY_SLUGS: readonly string[] = [...STORE_POLICY_SLUGS, ...MOVEMENT_POLICY_SLUGS]

// Titles for link lists (footer, movement page) without building full documents.
export const POLICY_LINKS: Record<string, string> = {
  'terms-of-service': 'Terms & Conditions of Sale',
  'privacy-policy': 'Privacy Policy',
  'cookie-policy': 'Cookie Policy',
  'shipping-returns': 'Shipping & Returns',
  'website-terms': 'Website Terms of Use',
  'membership-terms': 'Membership Terms',
  'spotlight-consent': 'Spotlight & Content Consent',
  'partner-sponsorship': 'Partner & Sponsorship Policy',
  'donations-fundraising': 'Donations & Fundraising',
  'starter-fund': 'Starter Fund Policy',
  safeguarding: 'Safeguarding Policy',
  'community-code': 'Community Code of Conduct',
  complaints: 'Complaints Policy',
}
