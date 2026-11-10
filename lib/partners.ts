import { z } from 'zod'
import { DOMAIN_PATTERN, normalizeCustomDomain, partnerRootDomain } from '@/lib/partner-hosts'

// Validation for marketplace partner data (Reference Part I).
// Admin controls identity (name, URL slug), status and commission; partners edit their own profile.

export const PAYOUT_METHODS = [
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'telecel_cash', label: 'Telecel Cash' },
  { value: 'at_money', label: 'AT Money' },
  { value: 'bank', label: 'Bank account' },
] as const

const payoutMethodValues = PAYOUT_METHODS.map((m) => m.value) as [string, ...string[]]

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional()

// Upload route returns a Blob CDN URL, a local /uploads/ path (dev) or a data: URL (no Blob token).
const imageUrl = z
  .string()
  .trim()
  .max(8_000_000)
  .refine((v) => v === '' || /^(https:\/\/|\/uploads\/|data:image\/)/.test(v), 'Invalid image')
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional()

/** Fields a partner may edit on their own page. */
export const PartnerProfileSchema = z.object({
  tagline: optionalText(120),
  description: optionalText(2000),
  logoUrl: imageUrl,
  bannerUrl: imageUrl,
  contactEmail: z.string().trim().email('Valid email is required').max(200),
  contactPhone: z.string().trim().min(9, 'Valid phone/WhatsApp number is required').max(30),
  location: optionalText(120),
  payoutMethod: z.enum(payoutMethodValues).nullable().optional(),
  payoutAccountName: optionalText(120),
  payoutAccountNumber: optionalText(40),
})

export type PartnerProfileInput = z.infer<typeof PartnerProfileSchema>

export const PARTNER_TYPES = [
  { value: 'market', label: 'Nova Market partner', hint: 'Sells their own items. Customers pay URBANOVA; URBANOVA takes a commission.' },
  { value: 'stockist', label: 'URBANOVA Stockist', hint: 'Sells their own stock of URBANOVA clothing plus their own items. Customers pay them directly. No commission.' },
] as const

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Admin edit: everything a partner can edit, plus identity, status and commission. */
export const AdminPartnerSchema = PartnerProfileSchema.extend({
  name: z.string().trim().min(2, 'Name is required').max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and dashes only'),
  status: z.enum(['pending', 'active', 'suspended']),
  // market = Nova Market partner (commission); stockist = sells URBANOVA stock + own items, paid directly
  type: z.enum(['market', 'stockist']).default('market'),
  // Their own website address (optional). Entered as "kumasidrip.com" or "https://www.kumasidrip.com".
  customDomain: z
    .string()
    .trim()
    .max(253)
    .optional()
    .nullable()
    .transform((v) => (v ? normalizeCustomDomain(v) : null))
    .refine((v) => v === null || DOMAIN_PATTERN.test(v), 'Enter a web address like kumasidrip.com')
    .refine((v) => {
      if (v === null) return true
      const root = partnerRootDomain()
      return !v.endsWith('.vercel.app') && (!root || (v !== root && !v.endsWith(`.${root}`)))
    }, 'That address can’t be used — enter the partner’s own domain'),
  // Percent in the form (e.g. 12.5); stored as basis points. Ignored for stockists (always 0).
  commissionPercent: z.number().min(0).max(100).nullable(),
})
  .refine((p) => p.type === 'stockist' || p.status !== 'active' || p.commissionPercent !== null, {
    message: 'Set a commission before making a partner active',
    path: ['commissionPercent'],
  })
  .refine((p) => p.type !== 'stockist' || p.status !== 'active' || (!!p.payoutMethod && !!p.payoutAccountName && !!p.payoutAccountNumber), {
    message: 'Customers pay stockists directly — add their Mobile Money details before making them live',
    path: ['payoutAccountNumber'],
  })

export type AdminPartnerInput = z.infer<typeof AdminPartnerSchema>

export const PartnerLoginUserSchema = z.object({
  userName: z.string().trim().min(2, 'Login name is required').max(80),
  userEmail: z.string().trim().toLowerCase().email('Valid login email is required').max(200),
})

export const CreatePartnerSchema = z.intersection(AdminPartnerSchema, PartnerLoginUserSchema)

export function percentToBps(percent: number | null): number | null {
  return percent === null ? null : Math.round(percent * 100)
}

export function bpsToPercent(bps: number | null): number | null {
  return bps === null ? null : bps / 100
}

export function formatCommission(bps: number | null): string {
  return bps === null ? 'Not set' : `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Data written to the Partner table from a validated admin payload. */
export function adminPartnerData(input: AdminPartnerInput) {
  const { commissionPercent, ...rest } = input
  return { ...rest, commissionBps: input.type === 'stockist' ? 0 : percentToBps(commissionPercent) }
}

/** Prisma unique-constraint violation (e.g. duplicate slug or login email). */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 'P2002'
}
