// Editable business details and policy parameters used by the policy and movement pages.
//
// Reference: docs/URBANOVA_REFERENCE.md Part H and docs/approved/URBANOVA_Policies_Terms.md s.1.1.
// Nothing here is a final founder decision unless it is set through an environment variable:
// - Identity fields (business name, registration number, TIN, addresses, DPC number) come from env
//   and are simply left off the public pages while unset — never shown as a placeholder.
// - `policyTerms` holds the suggested bracketed numbers from the Policies document. Founders and
//   their lawyer confirm or change them here, in one place.

const env = (key: string): string | undefined => process.env[key]?.trim() || undefined

// Ad pixel IDs are injected into a script, so only plain alphanumeric IDs are accepted.
const pixelId = (key: string): string | undefined => {
  const value = env(key)
  return value && /^[A-Za-z0-9]+$/.test(value) ? value : undefined
}

export const siteConfig = {
  businessName: env('BUSINESS_NAME'),
  registrationNumber: env('BUSINESS_REGISTRATION_NUMBER'),
  tin: env('BUSINESS_TIN'),
  address: env('BUSINESS_ADDRESS'),
  digitalAddress: env('BUSINESS_DIGITAL_ADDRESS'),
  /** Customer phone/WhatsApp, shown on policy pages (founder-confirmed Oct 2026). */
  phone: env('CONTACT_PHONE') ?? '+233 55 778 6833',
  /** Customer contact email: Contact page and policy pages (founder-confirmed Oct 2026). */
  email: env('CONTACT_EMAIL') ?? 'urbanovaclothing6@gmail.com',
  /** Where "Become a Partner" on /movement sends enquiries (founder-confirmed Oct 2026). */
  partnerEmail: env('PARTNER_EMAIL') ?? 'urbanovaclothing6@gmail.com',
  /** Social profiles shown in the footer (founder-supplied Oct 2026). */
  tiktokUrl: env('TIKTOK_URL') ?? 'https://www.tiktok.com/@urbanova55771',
  snapchatUrl: env('SNAPCHAT_URL') ?? 'https://www.snapchat.com/add/urban264474',
  movementEntityName: env('MOVEMENT_ENTITY_NAME'),
  dpcRegistrationNumber: env('DPC_REGISTRATION_NUMBER'),
  safeguardingLeadName: env('SAFEGUARDING_LEAD_NAME'),
  safeguardingLeadContact: env('SAFEGUARDING_LEAD_CONTACT'),
  /** Shown as "Effective: …" on each policy when set (e.g. "1 November 2026"). */
  policyEffectiveDate: env('POLICY_EFFECTIVE_DATE'),
  /** Retargeting pixels — loaded only after the visitor accepts marketing cookies. */
  metaPixelId: pixelId('META_PIXEL_ID'),
  tiktokPixelId: pixelId('TIKTOK_PIXEL_ID'),
}

export type SiteConfig = typeof siteConfig

/** WhatsApp click-to-chat link for the contact phone (wa.me needs digits only, with country code). */
export function whatsappChatUrl(): string | undefined {
  if (!siteConfig.phone) return undefined
  let digits = siteConfig.phone.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `233${digits.slice(1)}` // local Ghana format, e.g. 055…
  return `https://wa.me/${digits}`
}

// Suggested values from the bracketed numbers in the Policies document — pending founder/legal sign-off.
export const policyTerms = {
  dispatchDays: '1–2',
  faultyReportDays: 30,
  damageReportHours: 48,
  returnBackDays: 7,
  refundProcessingDays: 7,
  failedDeliveryAttempts: 2,
  unclaimedOrderDays: 14,
  orderRecordYears: 6,
  memberRecordYears: 2,
  dataRequestReplyDays: 21,
  contentRemovalDays: 7,
  donationRefundDays: 30,
  memberAgeRange: '16–30',
  starterFundMinMembershipMonths: 1,
  starterFundFollowUpMonths: 3,
  complaintAcknowledgeDays: 2,
  complaintResolveDays: 10,
  complaintReviewDays: 10,
}

export type PolicyTerms = typeof policyTerms
