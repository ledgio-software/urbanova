import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPartnerContext } from '@/lib/authz'
import { STOCKIST_NEXT } from '@/lib/stockist-orders'

export const dynamic = 'force-dynamic'

const Body = z.object({ status: z.enum(['paid', 'packed', 'shipped', 'delivered', 'cancelled']) })

// A stockist moves their own directly-paid orders forward. Other orders are 404 to them.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getPartnerContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.user.mustChangePassword) return NextResponse.json({ error: 'Set your password first' }, { status: 403 })

  const { id } = await params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 422 })

  const order = await prisma.order.findUnique({ where: { id }, select: { status: true, sellerPartnerId: true } })
  if (!order || order.sellerPartnerId !== ctx.partner.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!STOCKIST_NEXT[order.status].includes(parsed.data.status)) {
    return NextResponse.json({ error: 'That step isn’t possible for this order any more — reload the page' }, { status: 409 })
  }

  // Only move forward from the status we just read (two taps can't skip or repeat a step)
  const updated = await prisma.order.updateMany({ where: { id, status: order.status }, data: { status: parsed.data.status } })
  if (updated.count === 0) return NextResponse.json({ error: 'This order just changed — reload the page' }, { status: 409 })
  return NextResponse.json({ ok: true })
}
