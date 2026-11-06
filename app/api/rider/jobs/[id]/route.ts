import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getRiderContext } from '@/lib/authz'
import { MAX_CODE_ATTEMPTS, moveJob, riderCanMove } from '@/lib/delivery'

export const dynamic = 'force-dynamic'

const RiderActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('picked_up') }),
  z.object({ action: z.literal('on_the_way') }),
  z.object({ action: z.literal('delivered'), code: z.string().trim().regex(/^\d{4}$/, 'Enter the 4-digit code') }),
  z.object({ action: z.literal('failed'), reason: z.string().trim().min(3, 'Say what happened').max(300) }),
])

// A rider can only update jobs assigned to them, one step at a time; "delivered" needs the customer's code.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getRiderContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.rider.mustChangePassword) return NextResponse.json({ error: 'Set your password first' }, { status: 403 })
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = RiderActionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid action' }, { status: 422 })
  const a = parsed.data

  const job = await prisma.deliveryJob.findUnique({ where: { id } })
  if (!job || job.riderId !== ctx.rider.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!riderCanMove(job.status, a.action)) {
    return NextResponse.json({ error: 'This delivery has already moved on — refresh the page' }, { status: 409 })
  }

  if (a.action === 'delivered') {
    if (job.codeAttempts >= MAX_CODE_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many wrong codes. Call URBANOVA to confirm this delivery.' }, { status: 423 })
    }
    const ok = timingSafeEqual(Buffer.from(a.code), Buffer.from(job.deliveryCode))
    if (!ok) {
      const updated = await prisma.deliveryJob.update({ where: { id }, data: { codeAttempts: { increment: 1 } } })
      const left = MAX_CODE_ATTEMPTS - updated.codeAttempts
      return NextResponse.json(
        { error: left > 0 ? `Wrong code. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong codes. Call URBANOVA to confirm this delivery.' },
        { status: 400 },
      )
    }
    await moveJob(job, 'delivered', 'rider', { note: 'Confirmed with delivery code' })
  } else if (a.action === 'failed') {
    await moveJob(job, 'failed', 'rider', { note: a.reason, data: { failureReason: a.reason } })
  } else {
    await moveJob(job, a.action, 'rider')
  }
  return NextResponse.json({ ok: true })
}
