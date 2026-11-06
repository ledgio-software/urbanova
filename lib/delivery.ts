import { randomInt } from 'crypto'
import type { DeliveryJob, DeliveryStatus, Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/db'

// URBANOVA Delivery core (Reference Part J): status rules, codes, timeline, order sync.

export const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: 'Waiting for a rider',
  assigned: 'Rider assigned',
  picked_up: 'Picked up',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  failed: 'Delivery failed',
  cancelled: 'Cancelled',
}

/** Steps shown on the public tracking page, in order. */
export const TRACKING_STEPS: DeliveryStatus[] = ['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered']

export const ACTIVE_STATUSES: DeliveryStatus[] = ['assigned', 'picked_up', 'on_the_way']

export const MAX_CODE_ATTEMPTS = 5

// No 0/O/1/I/L — easy to read out over the phone
const TRACKING_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

export function generateTrackingCode(): string {
  let code = ''
  for (let i = 0; i < 8; i++) code += TRACKING_ALPHABET[randomInt(TRACKING_ALPHABET.length)]
  return `UD-${code}`
}

export function generateDeliveryCode(): string {
  return String(randomInt(0, 10_000)).padStart(4, '0')
}

// Who may move a job from one status to another.
const RIDER_TRANSITIONS: Partial<Record<DeliveryStatus, DeliveryStatus[]>> = {
  assigned: ['picked_up', 'failed'],
  picked_up: ['on_the_way', 'delivered', 'failed'],
  on_the_way: ['delivered', 'failed'],
}

export function riderCanMove(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return RIDER_TRANSITIONS[from]?.includes(to) ?? false
}

const FINAL: DeliveryStatus[] = ['delivered', 'cancelled']

export function isFinal(status: DeliveryStatus): boolean {
  return FINAL.includes(status)
}

/** Order status that follows a delivery status change (F.2 order lifecycle). */
function orderStatusFor(status: DeliveryStatus) {
  if (status === 'picked_up' || status === 'on_the_way') return 'shipped' as const
  if (status === 'delivered') return 'delivered' as const
  return null
}

/**
 * Moves a job to a new status, records a timeline event and keeps the linked order in step.
 * Callers check permissions first (riderCanMove / admin).
 */
export async function moveJob(
  job: Pick<DeliveryJob, 'id' | 'orderId'>,
  to: DeliveryStatus,
  actor: 'admin' | 'rider' | 'system',
  opts: { note?: string; data?: Prisma.DeliveryJobUpdateInput } = {},
) {
  const nextOrderStatus = orderStatusFor(to)
  await prisma.$transaction(async (tx) => {
    await tx.deliveryJob.update({ where: { id: job.id }, data: { ...opts.data, status: to } })
    await tx.deliveryEvent.create({ data: { jobId: job.id, status: to, actor, note: opts.note } })
    if (job.orderId && nextOrderStatus) {
      // Never move an order backwards (e.g. delivered → shipped) or out of cancelled/returned
      const allowedFrom =
        nextOrderStatus === 'shipped' ? ['paid', 'packed'] : ['paid', 'packed', 'shipped']
      await tx.order.updateMany({
        where: { id: job.orderId, status: { in: allowedFrom as ('paid' | 'packed' | 'shipped')[] } },
        data: { status: nextOrderStatus },
      })
    }
  })
}

const phone = z.string().trim().min(9, 'Valid phone number required').max(30)
const text = (min: number, max: number, msg: string) => z.string().trim().min(min, msg).max(max)

/** Admin creates a delivery: from a website order, or a manual booking (e.g. a business that called/WhatsApped). */
export const CreateDeliverySchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('order'),
    orderId: z.string().min(1),
    pickupAddress: text(5, 300, 'Pickup address is required'),
    notes: z.string().trim().max(500).optional(),
    riderId: z.string().min(1).nullable().optional(),
  }),
  z.object({
    kind: z.literal('booking'),
    pickupName: text(2, 120, 'Sender name is required'),
    pickupPhone: phone,
    pickupAddress: text(5, 300, 'Pickup address is required'),
    dropoffName: text(2, 120, 'Recipient name is required'),
    dropoffPhone: phone,
    dropoffAddress: text(5, 300, 'Drop-off address is required'),
    fee: z.number().int().nonnegative().max(10_000_00),
    notes: z.string().trim().max(500).optional(),
    riderId: z.string().min(1).nullable().optional(),
  }),
])

export type CreateDeliveryInput = z.infer<typeof CreateDeliverySchema>

/** Creates a job with unique codes; retries on the (very unlikely) tracking-code collision. */
export async function createJob(data: Omit<Prisma.DeliveryJobUncheckedCreateInput, 'trackingCode' | 'deliveryCode'>) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const status: DeliveryStatus = data.riderId ? 'assigned' : 'pending'
      return await prisma.deliveryJob.create({
        data: {
          ...data,
          status,
          trackingCode: generateTrackingCode(),
          deliveryCode: generateDeliveryCode(),
          events: { create: [{ status: 'pending', actor: 'admin' }, ...(data.riderId ? [{ status: 'assigned' as const, actor: 'admin' }] : [])] },
        },
      })
    } catch (err) {
      const code = (err as { code?: string }).code
      const target = String((err as { meta?: { target?: unknown } }).meta?.target ?? '')
      if (code === 'P2002' && target.includes('trackingCode')) continue
      throw err
    }
  }
  throw new Error('Could not generate a unique tracking code')
}

/** Google Maps search link for an address (opens the Maps app on phones). */
export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

/** Shows only the first name, for the public tracking page. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ''
}
