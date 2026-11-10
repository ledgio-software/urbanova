import { randomInt } from 'crypto'
import { z } from 'zod'
import { slugify } from '@/lib/partners'

// Partner product validation + identifiers (Reference Part I).

const imageUrl = z
  .string()
  .trim()
  .max(8_000_000)
  .refine((v) => /^(https:\/\/|\/uploads\/|data:image\/)/.test(v), 'Invalid image')

const option = (fallback: string) =>
  z
    .string()
    .trim()
    .max(30)
    .transform((v) => v || fallback)

export const PartnerVariantSchema = z.object({
  id: z.string().min(1).optional(), // existing variant being edited
  size: option('One size'),
  color: option('Standard'),
  stockQuantity: z.number().int().min(0).max(100_000),
  priceOverride: z.number().int().min(100).max(100_000_000).nullable(), // pesewas
})

export const PartnerProductSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required').max(80),
    description: z.string().trim().min(10, 'Add a short description (10+ characters)').max(2000),
    categoryId: z.string().min(1, 'Choose a category'),
    basePrice: z.number().int().min(100, 'Price must be at least GHS 1.00').max(100_000_000), // pesewas
    isActive: z.boolean(),
    images: z.array(imageUrl).min(1, 'Add at least one photo').max(6, 'Up to 6 photos'),
    variants: z.array(PartnerVariantSchema).min(1, 'Add at least one option').max(30),
  })
  .refine(
    (p) => new Set(p.variants.map((v) => `${v.size.toLowerCase()}|${v.color.toLowerCase()}`)).size === p.variants.length,
    { message: 'Each option (size + colour) must be different', path: ['variants'] },
  )

export type PartnerProductInput = z.infer<typeof PartnerProductSchema>

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const randomCode = (length: number) => Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')

/** Partner SKUs: NM-<partner>-<random>, kept apart from URBANOVA's URB- format (Reference C.6). */
export function partnerSku(partnerSlug: string): string {
  const prefix = partnerSlug.replace(/-/g, '').toUpperCase().slice(0, 10) || 'PARTNER'
  return `NM-${prefix}-${randomCode(6)}`
}

/** Product URL slug: readable name + short random suffix so partners never collide. */
export function partnerProductSlug(name: string): string {
  return `${slugify(name).slice(0, 50) || 'item'}-${randomCode(5).toLowerCase()}`
}
