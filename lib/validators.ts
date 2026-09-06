import { z } from 'zod'

// ─── Checkout ──────────────────────────────────────────────────────────────────

export const CheckoutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(9, 'Valid phone number is required'),
  deliveryZoneId: z.string().min(1, 'Delivery zone is required'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  paymentMethod: z.enum(['mtn_momo', 'vodafone_cash', 'airteltigo_money', 'card']),
  cartItems: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'Cart cannot be empty'),
})

export type CheckoutInput = z.infer<typeof CheckoutSchema>

// ─── Contact form ─────────────────────────────────────────────────────────────

export const ContactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type ContactInput = z.infer<typeof ContactSchema>

// ─── Newsletter signup ────────────────────────────────────────────────────────

export const NewsletterSchema = z.object({
  email: z.string().email('Valid email is required'),
})

export type NewsletterInput = z.infer<typeof NewsletterSchema>
