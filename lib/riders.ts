import { z } from 'zod'

export const RiderSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  phone: z.string().trim().min(9, 'Valid phone number is required').max(30),
  vehicle: z
    .string()
    .trim()
    .max(80)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
})

export const CreateRiderSchema = RiderSchema.extend({
  email: z.string().trim().toLowerCase().email('Valid login email is required').max(200),
})

export const UpdateRiderSchema = RiderSchema.extend({
  status: z.enum(['active', 'suspended']),
})
