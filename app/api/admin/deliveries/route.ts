import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/authz'
import { createJob, CreateDeliverySchema } from '@/lib/delivery'
import { siteConfig } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = CreateDeliverySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  const input = parsed.data

  if (input.riderId) {
    const rider = await prisma.rider.findUnique({ where: { id: input.riderId }, select: { status: true } })
    if (rider?.status !== 'active') return NextResponse.json({ error: 'That rider is not active' }, { status: 400 })
  }

  if (input.kind === 'order') {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: { customer: true, delivery: { select: { id: true } } },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.delivery) return NextResponse.json({ error: 'This order already has a delivery', deliveryId: order.delivery.id }, { status: 409 })
    if (!['paid', 'packed'].includes(order.status)) {
      return NextResponse.json({ error: 'Only paid or packed orders can be sent out for delivery' }, { status: 400 })
    }
    const job = await createJob({
      source: 'store_order',
      orderId: order.id,
      riderId: input.riderId ?? null,
      pickupName: 'URBANOVA',
      pickupPhone: siteConfig.phone ?? '',
      pickupAddress: input.pickupAddress,
      dropoffName: order.customer?.name ?? 'Customer',
      dropoffPhone: order.customer?.phone ?? '',
      dropoffAddress: order.deliveryAddress,
      fee: order.deliveryFee,
      notes: input.notes || null,
    })
    return NextResponse.json({ id: job.id }, { status: 201 })
  }

  const { kind: _kind, riderId, notes, ...booking } = input
  const job = await createJob({ source: 'booking', riderId: riderId ?? null, notes: notes || null, ...booking })
  return NextResponse.json({ id: job.id }, { status: 201 })
}
